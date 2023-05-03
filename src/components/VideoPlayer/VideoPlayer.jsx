import React from 'react';
import {useEffect, useRef, useState} from "react";
import css from "./VideoPlayer.module.css";
import Hls from "hls.js";
import CameraSvgIcon from "../../UI/svg/CameraSvgIcon";
import FullscreenSvgIcon from "../../UI/svg/FullscreenSvgIcon";
import PauseSvgIcon from "../../UI/svg/PauseSvgIcon";
import PlaySvgIcon from "../../UI/svg/PlaySvgIcon";
import VideoLoader from "../../UI/loaders/VideoLoader/VideoLoader";
import TimeLine from "./Storyboard/TimeLine";

function VideoPlayer({hlsStreamUrlProp}) {

	const videoElement = useRef(null);
	const canvasElement = useRef(null);
	const playerElement = useRef(null);
	const [start, setStart] = useState(false);
	const [storyboard, setStoryboard] = useState([]);
	const [loading, setLoading] = useState(true);
	const [hlsStreamUrl, setHlsStreamUrl] = useState(hlsStreamUrlProp);
	const [fullScreen, setFullScreen] = useState(false);
	const [dateTime, setDateTime] = useState(null);
	const firstPlay = useRef(true);

	useEffect(() => {
		setLoading(true);
		videoElement.current.volume = 0;
		const videoPlayer = videoElement.current;
		if (Hls.isSupported()) {
			const hls = new Hls({
				liveSyncDurationCount: 1,
				fragLoadingTimeOut: 30000,
				fragLoadingMaxRetry: 4,
				fragLoadingRetryDelay: 2000,
			});

			hls.loadSource(hlsStreamUrl);
			hls.attachMedia(videoPlayer);
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				videoPlayer.play();
			});

			hls.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
				data.samples.forEach((sample) => {
					const metadata = Hls.ID3.getID3Frames(sample.data);
					const timestampFrame = metadata.find((frame) => frame.key === 'TXXX');
					if (timestampFrame) {
						const timestamp = timestampFrame.info;
						console.log('Timestamp:', timestamp);
					}
				});
			});

			return () => {
				hls.destroy();
			};
		} else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
			videoPlayer.src = hlsStreamUrl;
			videoPlayer.addEventListener('loadedmetadata', () => {
				videoPlayer.play();
			});
		}
	}, [hlsStreamUrl]);

	useEffect(() => {
		const videoWorks = !!videoElement.current.canPlayType;
		if (videoWorks) {
			videoElement.current.controls = false;
		} else {
			videoElement.current.controls = true;
		}

		videoElement.current.addEventListener("play", (event) => {
			if (firstPlay.current) {
				const DateNow = new Date();
				setDateTime(DateNow.getTime());
				firstPlay.current = false;
			}
			setStart(true);
		});

		videoElement.current.addEventListener("loadeddata", () => {
			setLoading(false);
		});

		videoElement.current.addEventListener("error", () => {
			setLoading(false);
		});
	}, []);

	function saveFrame() {
		if (!start && loading) {
			return;
		}

		canvasElement.current.width = videoElement.current.videoWidth;
		canvasElement.current.height = videoElement.current.videoHeight;

		const context = canvasElement.current.getContext('2d');
		context.drawImage(videoElement.current, 0, 0, canvasElement.current.width, canvasElement.current.height);
		const currentTime = videoElement.current.currentTime;
		const frameDataURL = canvasElement.current.toDataURL('image/png');

		const DateNow = new Date();
		setStoryboard((prevFrames) => [...prevFrames, {
			image: frameDataURL,
			time: DateNow.getTime() - dateTime,
			ref: React.createRef()
		}]);
	}

	function togglePlay() {
		if (videoElement.current.paused || videoElement.current.ended) {
			const updatedHlsStreamUrl = `${hlsStreamUrl.split("?")[0]}?t=${Date.now()}`;
			setHlsStreamUrl(updatedHlsStreamUrl);
			setStart(true);
		} else {
			videoElement.current.pause();
			setStart(false);
		}
	}

	function toggleFullScreen() {
		if (fullScreen) {
			document.exitFullscreen();
			;
			setFullScreen(false);
		} else {
			playerElement.current.requestFullscreen();
			setFullScreen(true);
		}
	}

	const handleFullScreenChange = () => {
		const isFullScreen = document.fullscreenElement === playerElement.current;
		setFullScreen(isFullScreen);
	};

	useEffect(() => {
		document.addEventListener('fullscreenchange', handleFullScreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullScreenChange);
		};
	}, []);

	return (
		<>
			<div ref={playerElement} className={css.player}>
				<div className={`${css.video_container}`}>
					<video onClick={() => togglePlay()} ref={videoElement}
								 className={fullScreen ? css.video_view_fullscreen : css.video_view} controls autoPlay
					></video>

					<canvas ref={canvasElement} className={css.canvasFrame}></canvas>

					<div className={css.main_controls}>
						{loading && <VideoLoader/>}
					</div>

					{!loading && <div className={css.main_controls}>
						<div onClick={() => togglePlay()}
								 className={`${css.button_main_controls} ${(start ? css.hiden : "")}`}><PlaySvgIcon/>
						</div>
						<div onClick={() => togglePlay()}
								 className={`${css.button_main_controls} ${(!start ? css.hiden : "")}`}><PauseSvgIcon/>
						</div>
					</div>}

					<div className={css.submain_controls}>
						{start ? (<div className={`${css.submain_controls_button} ${css.right}`}
													 onClick={() => togglePlay()}><PauseSvgIcon></PauseSvgIcon></div>) :
							(<div className={`${css.submain_controls_button} ${css.right}`}
										onClick={() => togglePlay()}><PlaySvgIcon></PlaySvgIcon></div>)}
						<div className={`${css.submain_controls_button} ${css.right}`}
								 onClick={() => saveFrame()}><CameraSvgIcon></CameraSvgIcon></div>
						<div className={`${css.submain_controls_button} ${css.left}`}
								 onClick={() => toggleFullScreen()}><FullscreenSvgIcon></FullscreenSvgIcon></div>
					</div>
				</div>
			</div>
			<TimeLine frames={storyboard}></TimeLine>
		</>
	);
}

export default VideoPlayer;