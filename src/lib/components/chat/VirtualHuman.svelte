<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { virtualHumanWs } from '$lib/stores';

	const host = '20.243.127.11';

	export let show = false;

	let pc: RTCPeerConnection;
	let ws: WebSocket;

	$: if (show) {
		start();
	} else {
		stop();
	}

	onMount(() => {
		ws = new WebSocket(`ws://${host}:8000/humanecho`);
		ws.onopen = () => {};
		ws.onmessage = () => {};
		ws.onclose = () => {};
		virtualHumanWs.set(ws);
	});

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

		const res = await fetch(`http://${host}:1985/rtc/v1/whep/?app=live&stream=livestream`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/sdp'
			},
			body: pc.localDescription?.sdp
		});
		const answer = await res.text();
		await pc.setRemoteDescription({
			type: 'answer',
			sdp: answer
		});
	}

	function stop() {
		pc?.close();
		ws?.close();
		virtualHumanWs.set(null);
	}
</script>

{#if show}
	<div class="fixed z-20 top-10 bottom-10 right-10 w-80 flex justify-center align-middle">
		<video width="400" height="300" />
	</div>
{/if}
