import React from "react";
import { FaEdit, FaTrashAlt, FaArrowUp, FaArrowDown, FaLink, FaFilePdf, FaWhatsapp } from "react-icons/fa";
import CodeBlock from "@/components/codeBlock/CodeBlock";
import styles from "./ResourceList.module.css";

const ResourceItem = ({ resource, index, isAdmin, setResources, setIsModalOpen }) => {
    const openModal = (type, content, title, start, end, index, width, height) => {
        setIsModalOpen({
            isOpen: true,
            type,
            content,
            title,
            start,
            end,
            index,
            width,
            height,
        });
    };

    const handleRemoveResource = (index) => {
        setResources((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMoveResource = (index, direction) => {
        setResources((prev) => {
            const newArr = [...prev];
            if (direction === "up" && index > 0) {
                [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
            } else if (direction === "down" && index < newArr.length - 1) {
                [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
            }
            return newArr;
        });
    };

    const restartVideo = (index) => {
        const iframe = document.getElementById(`video-${index}`);
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    const generateYouTubeEmbedUrl = (url, start, end) => {
        const videoId = url.split("v=")[1]?.split("&")[0];
        if (!videoId) return "";
        let embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&enablejsapi=1`;
        if (start) embedUrl += `&start=${convertToSeconds(start)}`;
        if (end) embedUrl += `&end=${convertToSeconds(end)}`;
        return embedUrl;
    };

    const convertToSeconds = (time) => {
        const [h, m, s] = time.split(":").map(Number);
        return (h * 3600 || 0) + (m * 60 || 0) + (s || 0);
    };

    const handleSendProjectClick = () => {
        window.open("https://wa.me/?text=Hola, quiero enviar el proyecto", "_blank");
    };

    return (
        <div className={styles.block}>
            {isAdmin && (
                <div className={styles.resourceActions}>
                    <FaEdit
                        onClick={() =>
                            openModal(
                                resource.type,
                                resource.content,
                                resource.title || "",
                                resource.start || "",
                                resource.end || "",
                                index,
                                resource.width || "",
                                resource.height || ""
                            )
                        }
                        className={styles.icon}
                    />
                    <FaTrashAlt
                        onClick={() => handleRemoveResource(index)}
                        className={styles.icon}
                    />
                    <FaArrowUp
                        onClick={() => handleMoveResource(index, "up")}
                        className={styles.icon}
                    />
                    <FaArrowDown
                        onClick={() => handleMoveResource(index, "down")}
                        className={styles.icon}
                    />
                </div>
            )}

            {resource.type === "title" && (
                <h2 className={styles.titleResource}>
                    {resource.content || "Untitled"}
                </h2>
            )}

            {resource.type === "videoUrl" && (
                <div className={styles.videoWrapper}>
                    <iframe
                        src={generateYouTubeEmbedUrl(resource.content, resource.start, resource.end)}
                        title={`Video ${index + 1}`}
                        className={styles.videoFrame}
                        id={`video-${index}`}
                        allow="autoplay; encrypted-media; fullscreen"
                    ></iframe>
                    <button
                        onClick={() => restartVideo(index)}
                        className={styles.restartButton}
                    >
                        Reiniciar video
                    </button>
                </div>
            )}

            {resource.type === "imageUrl" && (
                <img
                    src={resource.content}
                    alt={resource.title || "Image"}
                    className={styles.imagePreview}
                    style={{ width: resource.width || 'auto', height: resource.height || 'auto' }}
                    width={200}
                    height={150}
                />
            )}

            {resource.type === "link" && (
                <a
                    href={resource.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resourceButton}
                >
                    <FaLink className={styles.resourceButtonIcon} />
                    {resource.title || "Unnamed Link"}
                </a>
            )}

            {resource.type === "pdfUrl" && (
                <a
                    href={resource.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resourceButton}
                >
                    <FaFilePdf className={styles.resourceButtonIcon} />
                    {resource.title || "Unnamed PDF"}
                </a>
            )}

            {resource.type === "text" && (
                <div
                    className={styles.textResource}
                    dangerouslySetInnerHTML={{
                        __html: resource.content
                            .replace(/^\s+/gm, (match) => "&nbsp;".repeat(match.length))
                            .replace(/\+([\s\S]*?)\+/g, (match, p1) => {
                                const items = p1
                                    .split("\n")
                                    .filter((line) => line.trim().startsWith("-"))
                                    .map((line) => `<li>${line.trim().substring(1).trim()}</li>`)
                                    .join("");
                                return `<ul>${items}</ul>`;
                            })
                            .replace(/\n/g, "<br>")
                            .replace(/\*(.*?)\*/g, "<b>$1</b>"),
                    }}
                />
            )}

            {resource.type === "sendProject" && (
                <button
                    className={styles.sendProjectButton}
                    onClick={handleSendProjectClick}
                >
                    <FaWhatsapp className={styles.sendProjectIcon} />
                    {resource.content || "Enviar Proyecto"}
                </button>
            )}

            {resource.type === "code" && (
                <CodeBlock code={resource.content} />
            )}
        </div>
    );
};

export default ResourceItem;
