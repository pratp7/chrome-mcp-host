const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Global MCP process and session
let mcpProcess = null;
let messageId = 0;
let pendingRequests = new Map();

// Initialize MCP server
function initializeMCP() {
    if (mcpProcess) return;

    mcpProcess = spawn('npx', ['-y', 'chrome-devtools-mcp@latest'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let buffer = '';
    mcpProcess.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.trim()) {
                try {
                    const message = JSON.parse(line.trim());
                    if (message.id && pendingRequests.has(message.id)) {
                        const { resolve } = pendingRequests.get(message.id);
                        pendingRequests.delete(message.id);
                        resolve(message);
                    }
                } catch (error) {
                    console.error('Failed to parse MCP message:', error);
                }
            }
        }
    });

    mcpProcess.stderr.on('data', (data) => {
        console.error('MCP stderr:', data.toString());
    });

    mcpProcess.on('exit', () => {
        console.log('MCP process exited');
        mcpProcess = null;
    });
}

// Send request to MCP server
function sendMCPRequest(method, params) {
    return new Promise((resolve, reject) => {
        if (!mcpProcess) {
            return reject(new Error('MCP server not initialized'));
        }

        const id = ++messageId;
        const message = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };

        pendingRequests.set(id, { resolve, reject });

        setTimeout(() => {
            if (pendingRequests.has(id)) {
                pendingRequests.delete(id);
                reject(new Error('Request timeout'));
            }
        }, 30000);

        mcpProcess.stdin.write(JSON.stringify(message) + '\n');
    });
}

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', mcpRunning: !!mcpProcess });
});

// Main endpoint for tool execution
app.post('/execute', async (req, res) => {
    try {
        const { tool, arguments: args } = req.body;

        if (!mcpProcess) {
            initializeMCP();
            // Wait a bit for MCP to initialize
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const response = await sendMCPRequest('tools/call', {
            name: tool,
            arguments: args || {}
        });

        res.json({ success: true, result: response.result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get available tools
app.get('/tools', async (req, res) => {
    try {
        if (!mcpProcess) {
            initializeMCP();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const response = await sendMCPRequest('tools/list', {});
        res.json({ success: true, tools: response.result.tools });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({
        service: 'Simple MCP Host',
        status: 'running',
        endpoints: {
            'POST /execute': 'Execute MCP tool',
            'GET /tools': 'List available tools',
            'GET /health': 'Health check'
        }
    });
});

// Initialize and start
initializeMCP();
app.listen(port, () => {
    console.log(`Simple MCP Host running on port ${port}`);
});

module.exports = app;