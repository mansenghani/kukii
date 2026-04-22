const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Colors
            const primaryColor = '#B76E79';
            const textColor = '#1A120B';
            const secondaryTextColor = '#6B5D4D';

            // Header
            doc.fillColor(textColor)
               .fontSize(24)
               .text('KUKI RESTAURANT', { align: 'center', letterSpacing: 5 })
               .fontSize(10)
               .fillColor(primaryColor)
               .text('EXQUISITE DINING REDEFINED', { align: 'center', letterSpacing: 3 })
               .moveDown(2);

            // Divider
            doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#efefef').stroke();

            // Client Info
            doc.moveDown(2);
            doc.fillColor(primaryColor).fontSize(10).text('INVOICE TO:', { bold: true });
            doc.fillColor(textColor).fontSize(14).text(data.customerId?.name || 'Guest', { bold: true });
            doc.fillColor(secondaryTextColor).fontSize(10).text(data.customerId?.email || '');
            doc.text(data.customerId?.phone || '');

            // Booking Details
            doc.moveUp(3);
            doc.fillColor(primaryColor).fontSize(10).text('INVOICE DETAILS:', { align: 'right' });
            doc.fillColor(textColor).fontSize(10).text(`Invoice No: INV-${data._id.toString().slice(-6).toUpperCase()}`, { align: 'right' });
            doc.text(`Date: ${new Date(data.date).toDateString()}`, { align: 'right' });
            doc.text(`Time: ${data.time}`, { align: 'right' });
            doc.text(`Guests: ${data.guests}`, { align: 'right' });

            doc.moveDown(4);

            // Table Header
            const tableTop = 280;
            doc.fillColor(primaryColor).fontSize(10).text('DESCRIPTION', 50, tableTop);
            doc.text('TABLE NO', 300, tableTop);
            doc.text('AMOUNT', 480, tableTop, { align: 'right' });

            doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#efefef').stroke();

            // Table Row
            const rowTop = tableTop + 30;
            doc.fillColor(textColor).fontSize(10).text(`${data.type || 'Table Reservation'}`, 50, rowTop);
            doc.text(`Table ${data.tableId?.tableNumber || 'N/A'}`, 300, rowTop);
            doc.text(`₹${data.totalAmount || 0}`, 480, rowTop, { align: 'right' });

            // Grand Total
            doc.moveDown(4);
            doc.fillColor(primaryColor).fontSize(12).text('GRAND TOTAL', 350);
            doc.moveUp(1);
            doc.fillColor(textColor).fontSize(20).text(`₹${data.totalAmount || 0}`, 480, doc.y, { align: 'right', bold: true });

            // Status
            doc.moveDown(2);
            doc.fillColor(data.status === 'Completed' ? '#2e7d32' : '#ed6c02')
               .fontSize(10)
               .text(`Payment Status: ${data.status || 'Pending'}`, { align: 'right' });

            // Footer
            const footerTop = 750;
            doc.fillColor('#efefef').moveTo(50, footerTop).lineTo(545, footerTop).stroke();
            doc.fillColor(secondaryTextColor)
               .fontSize(8)
               .text('Thank you for choosing KUKI. We hope to see you again soon.', 50, footerTop + 20, { align: 'center' })
               .text('© 2026 KUKI Restaurant. All Rights Reserved.', { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateInvoicePDF };
