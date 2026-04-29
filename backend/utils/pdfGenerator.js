const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                margin: 0, 
                size: 'A4' 
            });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Colors
            const primaryColor = '#B76E79'; // Dusty Rose
            const textColor = '#1A120B';
            const secondaryTextColor = '#6B5D4D';
            const lightGrey = '#FDFBFB';
            const borderGrey = '#EFEFEF';

            // 1. Header Section
            doc.rect(0, 0, 595, 120).fill(lightGrey); 
            doc.rect(0, 118, 595, 2).fill(primaryColor);

            doc.fillColor(textColor)
               .fontSize(32)
               .font('Helvetica-Bold')
               .text('KUKI RESTAURANT', 0, 40, { align: 'center', letterSpacing: 5 })
               .fontSize(10)
               .font('Helvetica')
               .fillColor(primaryColor)
               .text('EXQUISITE DINING REDEFINED', { align: 'center', letterSpacing: 3 });

            // 2. Info Section
            let currentY = 160;
            
            // Left Column: Client Info
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('INVOICE TO', 50, currentY);
            doc.fillColor(textColor).fontSize(16).text(data.customerId?.name || 'Valued Guest', 50, currentY + 15);
            doc.fillColor(secondaryTextColor).fontSize(10).font('Helvetica').text(data.customerId?.email || '', 50, currentY + 35);
            doc.text(data.customerId?.phone || '', 50, currentY + 48);

            // Right Column: Invoice Metadata
            const rightX = 360;
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('INVOICE DETAILS', rightX, currentY);
            doc.fillColor(textColor).fontSize(10).font('Helvetica')
               .text(`Invoice No:`, rightX, currentY + 15)
               .text(`Date:`, rightX, currentY + 28)
               .text(`Time:`, rightX, currentY + 41)
               .text(`Guests:`, rightX, currentY + 54);

            doc.fillColor(textColor).font('Helvetica-Bold')
               .text(`INV-${data._id.toString().slice(-6).toUpperCase()}`, rightX + 80, currentY + 15)
               .font('Helvetica')
               .text(`${new Date(data.date).toDateString()}`, rightX + 80, currentY + 28)
               .text(`${data.time}`, rightX + 80, currentY + 41)
               .text(`${data.guests}`, rightX + 80, currentY + 54);

            currentY += 100;

            // 3. Table Section
            doc.rect(50, currentY, 495, 30).fill(primaryColor);
            doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text('DESCRIPTION', 70, currentY + 10);
            doc.text('QTY', 300, currentY + 10);
            doc.text('AMOUNT', 450, currentY + 10, { align: 'right', width: 85 });

            currentY += 45;
            
            const hasPreOrder = data.preOrderId && data.preOrderId.items && data.preOrderId.items.length > 0;
            
            if (hasPreOrder) {
                // List Pre-order items
                data.preOrderId.items.forEach((item) => {
                    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(item.name || 'Menu Item', 70, currentY, { width: 220 });
                    doc.text(`${item.quantity}`, 300, currentY);
                    doc.font('Helvetica-Bold').text(`${item.total || 0}`, 450, currentY, { align: 'right', width: 85 });
                    
                    currentY += 25;
                    
                    // Check if we need to add a new page (though rare for restaurant pre-orders)
                    if (currentY > 700) {
                        doc.addPage({ margin: 0, size: 'A4' });
                        currentY = 50;
                    }
                });
            } else {
                // Default Table Reservation row
                doc.fillColor(textColor).fontSize(11).font('Helvetica').text(`${data.type || 'Table Reservation'}`, 70, currentY);
                doc.text('1', 300, currentY);
                doc.font('Helvetica-Bold').text(`${data.totalAmount || 0}`, 450, currentY, { align: 'right', width: 85 });
                currentY += 25;
            }

            doc.moveTo(50, currentY + 10).lineTo(545, currentY + 10).strokeColor(borderGrey).stroke();

            currentY += 40;

            // 4. Totals Section
            const amount = data.totalAmount || data.preOrderId?.grandTotal || 0;
            doc.fillColor(secondaryTextColor).fontSize(12).font('Helvetica').text('GRAND TOTAL', 350, currentY);
            doc.fillColor(textColor).fontSize(28).font('Helvetica-Bold').text(`${amount}`, 440, currentY - 8, { align: 'right', width: 100 });

            // IMPORTANT NOTE: No background, centered text
            currentY += 50;
            doc.fillColor('#c67c7c')
               .fontSize(12)
               .font('Helvetica-Bold')
               .text('IMPORTANT NOTE:', 50, currentY, { align: 'center', width: 495 })
               .font('Helvetica')
               .text('If you do not arrive within 30 minutes of your selected time slot, your table will be automatically cancelled.', { align: 'center', width: 495 });

            // Payment Status Badge
            currentY += 60;


            const statusColor = data.status === 'Completed' || data.status === 'Checked-in' ? '#2e7d32' : '#ed6c02';
            
            doc.save();
            doc.fillOpacity(0.1);
            doc.rect(420, currentY - 5, 130, 22).fill(statusColor);
            doc.restore();
            
            doc.fillColor(statusColor).fontSize(10).font('Helvetica-Bold').text(`STATUS: ${data.status?.toUpperCase() || 'PENDING'}`, 420, currentY, { align: 'center', width: 130 });

            // 5. Footer Section
            const footerY = 750;
            doc.rect(0, 800, 595, 42).fill(primaryColor); // Bottom bar
            
            doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(borderGrey).stroke();
            
            doc.fillColor(secondaryTextColor)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('Thank you for choosing KUKI Restaurant.', 50, footerY + 15, { align: 'center', width: 495 });
            
            doc.fillColor('#FFFFFF')
               .fontSize(8)
               .text('© 2026 KUKI Restaurant. All Rights Reserved.', 0, 815, { align: 'center', width: 595 });

            doc.end();


        } catch (err) {
            console.error('PDF Generation Error:', err);
            reject(err);
        }
    });
};

module.exports = { generateInvoicePDF };




