export const downloadQRCode = (downloadName:string) => {
		const svg = document.querySelector(".qrCode svg"); // Select the QR code SVG
		if (!svg) {
			console.error("QR code SVG not found.");
			return;
		}
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(svg);
		const img = new Image();

		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			if (ctx) {
				ctx.drawImage(img, 0, 0);
				const link = document.createElement("a");
				link.href = canvas.toDataURL("image/png");
				link.download = `${downloadName}.png`;
				link.click();
			} else {
				console.error("2D context not available.");
			}
		};

		img.src = "data:image/svg+xml;base64," + btoa(svgString);
	};