"use client"

import styles from "./fixedBtn.module.css";
import {
    FaWhatsapp,
} from "react-icons/fa";

export default function FixedBtn() {

    const handleWhatsApp = () => {
        window.open("https://wa.link/qggv19", "_blank");
    }

    return (
        <>
            <div onClick={handleWhatsApp} className={styles.btnContainer}>
                <FaWhatsapp className={styles.whatsAppIcon} />
            </div>
        </>
    )
};