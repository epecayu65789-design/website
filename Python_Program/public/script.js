document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (submitBtn) submitBtn.addEventListener('click', startAnalysis);
    if (resetBtn) resetBtn.addEventListener('click', resetApp);
});

async function startAnalysis() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const channel = document.getElementById('channel').value;

    if (!firstName || !lastName) {
        alert('Please provide both your First Name and Surname.');
        return;
    }

    // Shift to loading state visual UI
    document.getElementById('form-step').classList.add('hidden');
    document.getElementById('loading-step').classList.remove('hidden');

    const statusTitle = document.getElementById('loading-status');
    const statusSub = document.getElementById('loading-subtext');

    statusTitle.innerText = "Connecting to Core Engine...";
    statusSub.innerText = "Establishing secure database sync pipeline.";

    try {
        // HTTP POST Request to the Backend API
        const response = await fetch('/api/grow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, channel })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Server error occurred during execution.');
        }

        // Small decorative timeout so user witnesses the visual sequence
        setTimeout(() => {
            showDashboard(data.firstName, data.lastName, data.channel, data.projectedFollowers);
        }, 1500);

    } catch (error) {
        alert(`Failed to complete compilation: ${error.message}`);
        resetApp();
    }
}

function showDashboard(first, last, channel, followerCount) {
    document.getElementById('display-name').innerText = `${first} ${last}`;
    document.getElementById('display-channel').innerText = `${channel} Certified Growth Profile`;
    document.getElementById('follower-count').innerText = `+${followerCount.toLocaleString()}`;

    document.getElementById('loading-step').classList.add('hidden');
    document.getElementById('success-step').classList.remove('hidden');
}

function resetApp() {
    document.getElementById('first-name').value = '';
    document.getElementById('last-name').value = '';
    document.getElementById('success-step').classList.add('hidden');
    document.getElementById('form-step').classList.remove('hidden');
}