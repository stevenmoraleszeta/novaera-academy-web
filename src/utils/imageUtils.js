/**
 * Utilidades para el manejo de imágenes
 */

// Validar tipo de archivo
export const validateImageType = (file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    return allowedTypes.includes(file.type);
};

// Validar tamaño de archivo
export const validateImageSize = (file, maxSizeInMB = 5) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
};

// Validar dimensiones de imagen
export const validateImageDimensions = (file, minWidth = 150, minHeight = 150) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const valid = img.width >= minWidth && img.height >= minHeight;
            resolve(valid);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
    });
};

// Comprimir imagen si es necesario
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo aspect ratio
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a blob
            canvas.toBlob(resolve, file.type, quality);
        };

        img.src = URL.createObjectURL(file);
    });
};

// Validación completa de imagen
export const validateImage = async (file) => {
    const errors = [];

    if (!validateImageType(file)) {
        errors.push('Tipo de archivo no permitido. Solo se permiten PNG, JPEG y WebP.');
    }

    if (!validateImageSize(file)) {
        errors.push('El archivo es demasiado grande. El tamaño máximo es 5MB.');
    }

    const validDimensions = await validateImageDimensions(file);
    if (!validDimensions) {
        errors.push('La imagen debe tener al menos 150x150 píxeles.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Generar nombre único para archivo
export const generateUniqueFileName = (originalName, userId) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `profile_${userId}_${timestamp}_${randomString}.${extension}`;
};
