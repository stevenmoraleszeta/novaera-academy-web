import React from "react";
import { FaEdit, FaTrashAlt, FaArrowUp, FaArrowDown, FaLink, FaFilePdf, FaWhatsapp } from "react-icons/fa";
import CodeBlock from "@/components/codeBlock/CodeBlock";
import styles from "./ResourceList.module.css";

// Esto obtiene el campo en snake case o came case
const getField = (obj, ...fields) => {
    for (const f of fields) {
        if (obj[f] !== undefined && obj[f] !== null) return obj[f];
    }
    return "";
};

const ResourceItem = ({ resource, index, isAdmin, setResources, setIsModalOpen }) => {
    const type = getField(resource, "type", "typeresource", "typeResource");
    const content = getField(resource, "content", "contentresource", "contentResource");
    const title = getField(resource, "title");
    const start = getField(resource, "start", "starttime", "startTime");
    const end = getField(resource, "end", "endtime", "endTime");
    const width = getField(resource, "width");
    const height = getField(resource, "height");

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

    const handleRemoveResource = async (index) => {
        const resourceToDelete = resource;
        const resourceId = resourceToDelete.resourceid || resourceToDelete.resourceId || resourceToDelete.id;
        console.log(resourceId)
        if (!resourceId) {
            alert("No se encontró el ID del recurso para eliminar.");
            return;
        }
        if (!window.confirm("¿Seguro que deseas eliminar este recurso?")) return;
        try {
            const res = await fetch(`/api/class-resources/${resourceId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            console.log("Respuesta del backend: ", data)
            if (!res.ok) {
                alert(data.error || "Error al eliminar el recurso");
                return;
            }
            setResources((prev) => prev.filter((_, i) => i !== index));
        } catch (error) {
            alert("Error al eliminar el recurso");
            console.error(error);
        }
    };

    const handleMoveResource = async (index, direction) => {
        setResources((prev) => {
            const newArr = [...prev];
            let targetIndex = null;
            if (direction === "up" && index > 0) {
                targetIndex = index - 1;
            } else if (direction === "down" && index < newArr.length - 1) {
                targetIndex = index + 1;
            }
            if (targetIndex !== null) {
                [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];

                const resourceA = newArr[index];
                const resourceB = newArr[targetIndex];
                const idA = resourceA.resourceid || resourceA.resourceId || resourceA.id;
                const idB = resourceB.resourceid || resourceB.resourceId || resourceB.id;
                const orderA = resourceA.orderresource || resourceA.orderResource;
                const orderB = resourceB.orderresource || resourceB.orderResource;

                fetch(`/api/class-resources/${idA}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...resourceA, orderResource: orderA, orderresource: orderA }),
                });
                fetch(`/api/class-resources/${idB}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...resourceB, orderResource: orderB, orderresource: orderB }),
                });

                return newArr;
            }
            return prev;
        });
    };

    const restartVideo = (index) => {
        const iframe = document.getElementById(`video-${index}`);
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    const generateYouTubeEmbedUrl = (url, start, end) => {
        if (!url) return "";
        const videoId = url.split("v=")[1]?.split("&")[0];
        if (!videoId) return "";
        let embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&enablejsapi=1`;
        if (start) embedUrl += `&start=${convertToSeconds(start)}`;
        if (end) embedUrl += `&end=${convertToSeconds(end)}`;
        return embedUrl;
    };

    const convertToSeconds = (time) => {
        if (!time) return 0;
        const [h = 0, m = 0, s = 0] = time.split(":").map(Number);
        return (h * 3600) + (m * 60) + s;
    };

    const handleSendProjectClick = () => {
        window.open("https://wa.me/?text=Hola, quiero enviar el proyecto", "_blank");
    };

    let displayTitle = title;
    let displayContent = content;
    if ((type === "link" || type === "pdfUrl" || type === "enlace" || type === "documento") && content && content.includes("||")) {
        const [t, c] = content.split("||");
        displayTitle = t;
        displayContent = c;
    }

    return (
        <div className={styles.block}>
            {isAdmin && (
                <div className={styles.resourceActions}>
                    <FaEdit
                        onClick={() =>
                            openModal(
                                type,
                                content,
                                title || "",
                                start || "",
                                end || "",
                                index,
                                width || "",
                                height || ""
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

            {type === "title" && (
                <h2 className={styles.titleResource}>
                    {displayTitle || displayContent || "Untitled"}
                </h2>
            )}

            {(type === "videoUrl" || type === "video") && (
                <div className={styles.videoWrapper}>
                    <iframe
                        src={generateYouTubeEmbedUrl(displayContent, start, end)}
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

            {(type === "imageUrl" || type === "imagen") && (
                <img
                    src={displayContent}
                    alt={displayTitle || "Image"}
                    className={styles.imagePreview}
                    style={{ width: width || 'auto', height: height || 'auto' }}
                    width={200}
                    height={150}
                />
            )}

            {(type === "link" || type === "enlace") && (
                <a
                    href={displayContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resourceButton}
                >
                    <FaLink className={styles.resourceButtonIcon} />
                    {displayTitle || "Unnamed Link"}
                </a>
            )}

            {(type === "pdfUrl" || (type === "documento" && displayContent && displayContent.endsWith(".pdf"))) && (
                <a
                    href={displayContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resourceButton}
                >
                    <FaFilePdf className={styles.resourceButtonIcon} />
                    {displayTitle || "Unnamed PDF"}
                </a>
            )}

            {type === "text" && (
                <div
                    className={styles.textResource}
                    dangerouslySetInnerHTML={{
                        __html: displayContent
                            ? displayContent
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
                                .replace(/\*(.*?)\*/g, "<b>$1</b>")
                            : ""
                    }}
                />
            )}

            {type === "documento" && (
                displayTitle
                    ? (
                        <h2 className={styles.titleResource}>
                            {displayTitle}
                        </h2>
                    )
                    : (
                        <div
                            className={styles.textResource}
                            dangerouslySetInnerHTML={{
                                __html: displayContent
                                    ? displayContent
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
                                        .replace(/\*(.*?)\*/g, "<b>$1</b>")
                                    : ""
                            }}
                        />
                    )
            )}

            {(type === "sendProject" || type === "quiz") && (
                <button
                    className={styles.sendProjectButton}
                    onClick={handleSendProjectClick}
                >
                    <FaWhatsapp className={styles.sendProjectIcon} />
                    {displayContent || "Enviar Proyecto"}
                </button>
            )}

            {type === "code" && (
                <CodeBlock code={displayContent} />
            )}
        </div>
    );
};

export default ResourceItem;