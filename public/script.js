
document.getElementById('useRandomNames').addEventListener('change', function() {
    document.getElementById('botNameGroup').style.display = 
        this.checked ? 'none' : 'block';
});

let currentPin = null;

async function startBots() {
    currentPin = document.getElementById('pin').value;
    const pin = currentPin;
    const botCount = document.getElementById('botCount').value;
    const useRandomNames = document.getElementById('useRandomNames').checked;
    const botName = document.getElementById('botName').value;
    const useNameBypass = document.getElementById('useNameBypass').checked;
    const controlManually = document.getElementById('controlManually').checked;

    const statusDiv = document.getElementById('status');
    statusDiv.className = '';
    statusDiv.textContent = 'Starting bots...';

    try {
        const response = await fetch('/join-kahoot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pin,
                botCount,
                useRandomNames,
                botName,
                useNameBypass,
                controlManually
            })
        });

        const data = await response.json();
        
        if (data.success) {
            statusDiv.className = 'success';
            statusDiv.textContent = `Successfully started ${botCount} bots!`;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        statusDiv.className = 'error';
        statusDiv.textContent = `Error: ${error.message}`;
    }
}

async function leaveBots() {
    if (!currentPin) return;
    
    const statusDiv = document.getElementById('status');
    try {
        const response = await fetch('/leave-kahoot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pin: currentPin })
        });

        const data = await response.json();
        
        if (data.success) {
            statusDiv.className = 'success';
            statusDiv.textContent = data.message;
            currentPin = null;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        statusDiv.className = 'error';
        statusDiv.textContent = `Error: ${error.message}`;
    }
}
