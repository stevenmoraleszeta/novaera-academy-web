import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import styles from "./CourseVideo.module.css";

function getEmbedUrl(url) {
    if (!url) return "";
    if (url.includes("/embed/")) return url.includes("controls=1") ? url : url + "?controls=1";

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?controls=1`;
    }
    return url;
}

const CourseVideo = ({ course, isAdmin, openVideoModal }) => {
    const embedUrl = getEmbedUrl(course?.videourl);
    return (
        <div className={styles.courseVideo}>
            <div className={styles.videoWrapper}>
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        title="Course video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        width="100%"
                        height="360"
                    ></iframe>
                ) : (
                    <div className={styles.videoPlaceholder}>Video no disponible</div>
                )}

                {isAdmin && (
                    <button className={styles.editVideoButton} onClick={openVideoModal}>
                        <FaPencilAlt /> Editar Video
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseVideo;