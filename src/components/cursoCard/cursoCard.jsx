import styles from "./cursoCard.module.css";
import Image from "next/image";

export default function CursoCard(props) {
    const { imgSrc, titleText, descText, height, width, icon, link } = props;
    return (
        <>
            <a href={link} className={styles.cardContainer}>
                <Image className={styles.courseImg} width={width}
                    height={height} src={imgSrc} alt="imageCurso">
                </Image>
                <Image className={styles.iconImg} width={1000} height={1000} src={icon} alt="pythonLogo"></Image>
                <div className={styles.textContainer}>
                    <h2>{titleText}</h2>
                    <p>{descText}</p>
                </div>
            </a>
        </>
    );
}