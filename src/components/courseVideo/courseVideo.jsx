import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import styles from "./CourseVideo.module.css";

const CourseVideo = ({ course, isAdmin, openVideoModal }) => {
    return (
        <div className={styles.courseVideo}>
            <div className={styles.videoWrapper}>
                {course.videoUrl ? (
                    <iframe
                        src={course.videoUrl}
                        title="Course video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
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