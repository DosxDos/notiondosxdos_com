import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

function obtenerFechaActual() {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const hoy = new Date();
    return `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}

export async function generarPresupuestoPDF(datosOT, rutaSalida = './presupuesto_generado.pdf') {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const colorRojo = rgb(0.686, 0.106, 0.165);
    const colorNegro = rgb(0, 0, 0);
    const colorGris = rgb(0.572, 0.572, 0.572);

    const fechaActual = obtenerFechaActual();
    const textoVertical = 'Urb- Juan Ascanio s/n 35220 Jinamar (Gran Canaria) - Telf.: 928 71 22 22 - email: dosxdos@infonegocio.com - CIF: B-35590314';

    const addPageWithLayout = () => {
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();

        const margenDerechoX = width - 40;
        page.drawLine({ start: { x: margenDerechoX, y: 15 }, end: { x: margenDerechoX, y: height - 150 }, thickness: 2, color: colorRojo });

        const footerYH = 620;
        page.drawLine({ start: { x: 450, y: footerYH }, end: { x: width - 15, y: footerYH }, thickness: 1, color: colorRojo });

        const footerY = 40;
        page.drawLine({ start: { x: 15, y: footerY }, end: { x: width - 15, y: footerY }, thickness: 2, color: colorRojo });

        page.drawText("presupuesto", { x: 460, y: footerYH + 8, size: 10, font, color: colorNegro });
        page.drawText("nº." + datosOT.C_digo, { x: 470, y: footerYH - 12, size: 10, font, color: colorNegro });
        page.drawText(fechaActual, { x: 40, y: footerY + 4, size: 10, font, color: colorNegro });
        page.drawText(textoVertical, { x: margenDerechoX + 20, y: 80, size: 9, font, color: colorGris, rotate: degrees(90) });

        return page;
    };

    let page = addPageWithLayout();
    const { width, height } = page.getSize();

    const drawText = (text, x, y, size = 10, color = colorNegro) => {
        page.drawText(text, { x, y, size, font, color });
    };

    const imageBytes = fs.readFileSync(path.join('public/img', 'dosxdos_logo.png'));
    const image = await pdfDoc.embedPng(imageBytes);
    const imgWidth = 100;
    const imgHeight = (image.height / image.width) * imgWidth;
    const imgX = 40;
    const imgY = height - 60 - imgHeight;
    page.drawImage(image, { x: imgX, y: imgY, width: imgWidth, height: imgHeight });

    const footerYH = 620;
    let blockY = footerYH + 12;

    const mesActual = fechaActual.split(' de ')[1].toUpperCase();
    const anioActual = fechaActual.split(' de ')[2];

    drawText(`ESCAPARATES "${datosOT.Firma || ''}" - ${mesActual} ${anioActual}`, 40, blockY, 14, colorNegro);
    blockY -= 18;
    drawText(`OT/${datosOT.C_digo || 'N/A'}`, 40, blockY, 12, colorNegro);
    blockY -= 24;

    const textoIntro = `Por la realización de materiales y montaje de escaparates, con su firma "${datosOT.Firma || ''}" y comunicación "${datosOT.Deal_Name || ''}", en diversos puntos de venta de Canarias, según vuestras indicaciones.`;
    const textoListado = `Este presupuesto incluye:`;

    const drawMultiline = (text, startX, startY, lineHeight = 13) => {
        const maxWidth = 500;
        const words = text.split(' ');
        let line = '';
        for (const word of words) {
            const testLine = line + word + ' ';
            if (font.widthOfTextAtSize(testLine, 10) > maxWidth) {
                page.drawText(line.trim(), { x: startX, y: startY, size: 10, font });
                startY -= lineHeight;
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        if (line) {
            page.drawText(line.trim(), { x: startX, y: startY, size: 10, font });
            startY -= lineHeight;
        }
        return startY;
    };

    blockY = drawMultiline(textoIntro, 40, blockY);
    blockY -= 10;
    drawText(textoListado, 40, blockY);
    blockY -= 14;

    const listaFija = [
        'Planteamiento de sus elementos con el espacio.',
        'Realización de propuestas y bocetos enviados hasta su aprobación.',
        'Realización de materiales necesarios.',
        'Portes y desplazamientos, entre islas, a los puntos de venta indicados.',
        'Montaje de escaparates, dentro de nuestras rutas de trabajo.'
    ];

    for (const item of listaFija) {
        blockY = drawMultiline(`• ${item}`, 50, blockY);
    }

    blockY -= 30;
    const drawTableCell = (text, x, y, width, height) => {
        page.drawRectangle({ x, y: y - height, width, height, borderColor: colorNegro, borderWidth: 1 });
        page.drawText(text, { x: x + 4, y: y - height + 4, size: 10, font });
    };

    const colX = [50, 300, 370, 470];
    const colWidth = [250, 70, 100, 70];
    const rowHeight = 20;

    drawTableCell('CONCEPTO', colX[0], blockY, colWidth[0], rowHeight);
    drawTableCell('Uds.', colX[1], blockY, colWidth[1], rowHeight);
    drawTableCell('Importe', colX[2], blockY, colWidth[2], rowHeight);
    drawTableCell('Total', colX[3], blockY, colWidth[3], rowHeight);
    blockY -= rowHeight;

    for (const pdv of datosOT.puntos_de_venta || []) {
        const nombre = pdv.PDV_relacionados?.name || 'Punto de venta';
        const totalEscaparates = (pdv.escaparates || []).length;

        drawTableCell(nombre, colX[0], blockY, colWidth[0], rowHeight);
        drawTableCell(`${totalEscaparates}`, colX[1], blockY, colWidth[1], rowHeight);
        drawTableCell('0 €', colX[2], blockY, colWidth[2], rowHeight);
        drawTableCell('0 €', colX[3], blockY, colWidth[3], rowHeight);
        blockY -= rowHeight;
    }

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    for (let i = 0; i < totalPages; i++) {
        const currentPage = pages[i];
        const pageWidth = currentPage.getSize().width;
        const fontSize = 10;
        const text = `${i + 1}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        currentPage.drawText(text, {
            x: pageWidth - 40 - textWidth + 20,
            y: 20,
            size: fontSize,
            font,
            color: colorNegro
        });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(rutaSalida, pdfBytes);
    return rutaSalida;
}
