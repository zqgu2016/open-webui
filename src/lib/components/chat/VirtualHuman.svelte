<script lang="ts">
	import { WEBUI_BASE_URL } from '$lib/constants';

	let pc: RTCPeerConnection;

	function start() {
		pc = new RTCPeerConnection();

		pc.ontrack = (evt) => {
			const video = document.querySelector('video');

			if (video && evt.track.kind === 'video') {
				video.srcObject = evt.streams[0];
				video.play();
			}
		};

		pc.addTransceiver('video', { direction: 'recvonly' });
		pc.addTransceiver('audio', { direction: 'recvonly' });

		negotiate();
	}

	async function negotiate() {
		await pc.setLocalDescription(await pc.createOffer());

		const res = await fetch(`${WEBUI_BASE_URL}/virtual_human/offer`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sdp: pc.localDescription.sdp,
				type: pc.localDescription.type
			})
		});
		const answer = await res.json();
		await pc.setRemoteDescription(answer);
	}

	function stop() {
		pc.close();
	}
</script>

<div style="paddling-bottom: 30px; display: flex; flex-direction: column; justify-content: center;">
	<h3>Virtual Human Demo</h3>
	<video width="400" height="400" />
	<div style="margin-top: 30px">
		<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={start}>Start</button>
		<button class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" on:click={stop}>Stop</button>
	</div>
</div>
