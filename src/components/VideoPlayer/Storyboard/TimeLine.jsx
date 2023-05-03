import React, {useEffect, useRef, useState} from 'react';
import css from './TimeLine.module.css';
import FullScreenImage from '../FullScreenImage/FullScreenImage'

const TimeLine = ({frames}) => {
	const timelineWrapperRef = useRef();
	const timelineRef = useRef();
	const [nativeFrames, setNativeFrames] = useState(frames);

	useEffect(() => {
		setNativeFrames(frames.map((frame) => {
			const newPosition = calculateNewPosition(frame.time, timelineRef.current.clientWidth);
			return {...frame, newPosition: newPosition};
		}));

	}, [frames]);

	const handleWheel = (event) => {
		event.preventDefault();

		const scaleFactor = 0.1;
		const direction = event.deltaY < 0 ? 1 : -1;
		const oldWidth = timelineRef.current.clientWidth;
		const newWidth = oldWidth * (1 + scaleFactor * direction);

		const mouseX = event.clientX - timelineRef.current.getBoundingClientRect().left;
		const newScrollLeft = (timelineWrapperRef.current.scrollLeft + mouseX) * (newWidth / oldWidth) - mouseX;

		timelineRef.current.style.width = `${newWidth}px`;
		updateFramesPosition();
		timelineWrapperRef.current.scrollLeft = newScrollLeft;
	};

	useEffect(() => {
		const wrapper = timelineWrapperRef.current;
		wrapper.addEventListener('wheel', handleWheel, {passive: false});

		return () => {
			wrapper.removeEventListener('wheel', handleWheel);
		};
	}, [handleWheel]);

	const updateFramesPosition = () => {
		setNativeFrames(nativeFrames.map((frame) => {
			const newPosition = calculateNewPosition(frame.time, timelineRef.current.clientWidth);
			const newFrame = {...frame};
			newFrame.newPosition = newPosition;

			frame.ref.current.style.left = `${newPosition}%`;
			return frame;
		}));
	};

	const calculateNewPosition = (seconds, timelineWidth) => {
		const maxTimeInSeconds = 3600;
		return (timelineWidth * (seconds / 1000 / maxTimeInSeconds));

	};

	const formatTime = (milliseconds) => {
		const seconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		const remainingMilliseconds = Math.floor(milliseconds % 1000);

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMilliseconds.toString().padStart(3, '0')}`;
	};

	return (
		<div className={`${css.timeline_wrapper}`} ref={timelineWrapperRef}>
			<div className={css.timeline} ref={timelineRef}>
				{nativeFrames.map((frame, index) => (
					<div className={css.frame} style={{left: `${frame.newPosition}%`}} key={index} ref={frame.ref}>
						<FullScreenImage imageUrl={frame.image}>
							<img src={frame.image}/>
						</FullScreenImage>
						<span className={css.time}>{formatTime(frame.time)}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default TimeLine;