import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { LegalRules } from '../../types/domain';

export type ReceiptPdfInput = {
  title: string;
  number: string;
  landlordName: string;
  landlordAddress: string;
  tenantName: string;
  propertyName: string;
  propertyAddress: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  rentAmount: number | null;
  chargesAmount: number | null;
  totalAmount: number;
  currency: string;
  method: string | null;
  legalNotice: string;
  splitRentAndCharges: boolean;
  signature: string | null;
  countryCode: string;
};

export async function renderReceiptPdf(filePath: string, data: ReceiptPdfInput, _rules: LegalRules): Promise<void> {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const L = labels(data.countryCode);
    doc.fontSize(18).text(data.title, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#555').text(`No. ${data.number}`, { align: 'center' });
    doc.fillColor('#000').moveDown(1.5);

    line(doc, L.landlord, data.landlordName);
    if (data.landlordAddress) line(doc, L.landlordAddress, data.landlordAddress);
    line(doc, L.tenant, data.tenantName);
    line(doc, L.property, `${data.propertyName} — ${data.propertyAddress}`);
    line(doc, L.period, `${formatDate(data.periodStart)} → ${formatDate(data.periodEnd)}`);
    line(doc, L.paidOn, formatDate(data.paymentDate));
    if (data.method) line(doc, L.method, data.method);

    doc.moveDown(0.8);
    if (data.splitRentAndCharges) {
      line(doc, L.rent, money(data.rentAmount ?? 0, data.currency));
      line(doc, L.charges, money(data.chargesAmount ?? 0, data.currency));
    }
    doc.font('Helvetica-Bold');
    line(doc, L.total, money(data.totalAmount, data.currency));
    doc.font('Helvetica');

    doc.moveDown(1.2);
    doc.fontSize(9).fillColor('#333').text(data.legalNotice, { align: 'justify' });

    if (data.signature) {
      doc.moveDown(2);
      doc.fontSize(11).fillColor('#000').text(data.signature, { align: 'right' });
    }

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

function labels(countryCode: string) {
  if (countryCode === 'FR') {
    return {
      landlord: 'Bailleur',
      landlordAddress: 'Adresse du bailleur',
      tenant: 'Locataire',
      property: 'Bien',
      period: 'Période',
      paidOn: 'Date de paiement',
      method: 'Mode de paiement',
      rent: 'Loyer',
      charges: 'Charges',
      total: 'Total reçu',
    };
  }
  return {
    landlord: 'Landlord',
    landlordAddress: 'Landlord address',
    tenant: 'Tenant',
    property: 'Property',
    period: 'Period',
    paidOn: 'Payment date',
    method: 'Payment method',
    rent: 'Rent',
    charges: 'Service charges',
    total: 'Amount received',
  };
}

function line(doc: PDFKit.PDFDocument, label: string, value: string): void {
  doc.fontSize(11);
  doc.font('Helvetica-Bold').text(`${label} : `, { continued: true });
  doc.font('Helvetica').text(value);
  doc.moveDown(0.25);
}

function money(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
