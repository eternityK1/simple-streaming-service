import React, {useState} from 'react';
import css from './FullScreenImage.module.css';

const FullScreenImage = ({imageUrl, children}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	return (
		<>
			{React.cloneElement(children, {onClick: openModal})}
			{isModalOpen && (
				<div className={css.modal} onClick={closeModal}>
					<img src={imageUrl} className={css.modal_image}/>
				</div>
			)}
		</>
	);
};

export default FullScreenImage;