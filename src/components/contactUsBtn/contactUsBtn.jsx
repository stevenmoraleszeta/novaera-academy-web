"use client";

import styles from './contactUsBtn.module.css'

export default function ContactUsBtn(props) {
    const { link } = props;

    const handleLink = () => {
        window.open(link)
    }

    return (
        <button onClick={handleLink} className={styles.link}>Contáctanos</button>
    )
}