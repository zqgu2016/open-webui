<script lang="ts">
	import { onDestroy } from 'svelte';

	import { WEBUI_BASE_URL } from '$lib/constants';

	export let show = false;

	let pc: RTCPeerConnection;

	$: if (show) {
		start();
	} else {
		stop();
	}

	onDestroy(() => {
		stop();
	});

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
		pc && pc.close();
	}
</script>

{#if show}
	<div class="fixed z-20 top-10 bottom-10 right-10 w-80 flex justify-center align-middle">
		<video width="400" height="300" />
	</div>
{/if}
