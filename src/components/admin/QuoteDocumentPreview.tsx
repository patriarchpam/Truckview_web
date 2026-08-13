import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatPrice } from '../../utils/format';
import type { Booking, QuoteItem } from '../../types';
import { Button } from '../ui/Button';
import { Download, XIcon } from 'lucide-react';

interface QuoteDocumentPreviewProps {
  booking: Booking;
  quoteData: {
    quotationNumber: string;
    date: string;
    validUntil: string;
    preparedBy: string;
    items: Omit<QuoteItem, 'id'>[];
    subtotal: number;
    salesTaxRate: number;
    taxAmount: number;
    otherFees: number;
    total: number;
    comments: string;
  };
  onClose: () => void;
}

export function QuoteDocumentPreview({ booking, quoteData, onClose }: QuoteDocumentPreviewProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);



  const handleDownload = async () => {
    if (!documentRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quote_${quoteData.quotationNumber}_${booking.customer.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col overflow-y-auto p-4 sm:p-8">
      {/* Top action bar */}
      <div className="w-full max-w-[210mm] mx-auto flex justify-between items-center mb-6 bg-surface p-4 rounded-xl shadow-lg shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-ink">Preview Document</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            <XIcon size={16} /> Close
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            <Download size={16} /> {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>
      
      {/* A4 Document Container Wrapper */}
      <div className="w-full overflow-x-auto flex justify-start sm:justify-center pb-8">
        <div 
          className="w-[210mm] min-h-[297mm] bg-white text-black pt-[25mm] px-[20mm] pb-[15mm] shadow-2xl shrink-0 relative overflow-hidden flex flex-col" 
          ref={documentRef}
        >
        {/* Background Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.15]">
          <img src="/logo.png" alt="" className="w-3/4 grayscale" />
        </div>

        <div className="relative z-10 flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-64">
              <img src="/logo.png" alt="TruckView" className="w-full object-contain" />
            </div>
            <div className="text-right pt-6">
              <div className="text-2xl font-bold text-[#6495ED] tracking-wide mb-1">TRUCK-VIEW GLOBAL ENT.</div>
              <div className="text-sm font-medium">The Resident's Association Office</div>
              <div className="text-sm">Games Village, Kaura District Abuja</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-3xl font-light text-[#F4A460] tracking-wider">Maintenance Quote</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm leading-relaxed">
            <div>
              <div className="flex"><span className="w-32 font-bold">Quotation For:</span> <span>{booking.vehicleDetails}</span></div>
              <div className="flex"><span className="w-32 font-bold">Name</span> <span>{booking.customer.name}</span></div>
              <div className="flex"><span className="w-32 font-bold">Company Name</span> <span>Truck-View Global Enterprise</span></div>
              <div className="flex"><span className="w-32 font-bold">Street Address</span> <span>Games Village, Kaura District Abuja</span></div>
              <div className="flex"><span className="w-32 font-bold">City, ST ZIP Code</span> <span>Abuja, 900103</span></div>
              <div className="flex"><span className="w-32 font-bold">Phone & Email</span> 
                <span className="text-blue-600 underline break-all whitespace-pre-wrap">2348036798700 & 2348039717973{'\n'}truckviewent@gmail.com</span>
              </div>
            </div>
            <div>
              <div className="flex"><span className="w-32 font-bold">DATE</span> <span>{quoteData.date}</span></div>
              <div className="flex"><span className="w-32 font-bold">Quotation #</span> <span>{quoteData.quotationNumber}</span></div>
              <div className="flex"><span className="w-32 font-bold">Customer ID</span> <span>{booking.id.substring(0, 8).toUpperCase()}</span></div>
            </div>
          </div>

          {/* Comments & Instructions Header */}
          <div className="flex justify-between mb-2 text-sm font-bold">
            <div>Comments or Special Instructions: <span className="font-normal pl-4">{quoteData.comments || 'None'}</span></div>
            <div className="bg-[#FFFACD] px-8 py-1">Instructions: ▼</div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-sm border-collapse border border-black mb-8">
            <thead>
              <tr className="bg-[#800000] text-white">
                <th className="border border-black px-2 py-1 font-bold text-center w-20">QUANTITY</th>
                <th className="border border-black px-2 py-1 font-bold text-left">DESCRIPTION</th>
                <th className="border border-black px-2 py-1 font-bold text-center w-40">UNIT PRICE</th>
                <th className="border border-black px-2 py-1 font-bold text-center w-40">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {quoteData.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-black px-2 py-1 text-center bg-white">{item.quantity}</td>
                  <td className="border border-black px-2 py-1 bg-white">{item.description}</td>
                  <td className="border border-black px-2 py-1 text-right bg-[#E8E8E8]">{formatPrice(item.unitPrice).replace('₦', '')}</td>
                  <td className="border border-black px-2 py-1 text-right bg-[#E8E8E8]">{formatPrice(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Totals & Info */}
          <div className="flex justify-between text-sm">
            <div className="space-y-4 pt-10">
              <div className="italic">Quote valid until: <span className="font-normal not-italic">{quoteData.validUntil}</span></div>
              <div className="italic">Quote Prepared by: <span className="font-normal not-italic">{quoteData.preparedBy}</span></div>
            </div>
            
            <table className="w-72 border-collapse">
              <tbody>
                <tr>
                  <td className="text-right font-bold pr-2 py-1">SUBTOTAL</td>
                  <td className="border border-black px-2 py-1 text-right bg-[#E8E8E8] font-bold w-32">{formatPrice(quoteData.subtotal)}</td>
                </tr>
                <tr>
                  <td className="text-right pr-2 py-1 text-xs text-gray-500">{quoteData.salesTaxRate}%</td>
                  <td className="border border-black px-2 py-1 text-right bg-white w-32"></td>
                </tr>
                <tr>
                  <td className="text-right font-bold pr-2 py-1">SALES TAX</td>
                  <td className="border border-black px-2 py-1 text-right bg-[#E8E8E8] w-32">{quoteData.taxAmount > 0 ? formatPrice(quoteData.taxAmount) : '-'}</td>
                </tr>
                <tr>
                  <td className="text-right font-bold pr-2 py-1">OTHER</td>
                  <td className="border border-black px-2 py-1 text-right bg-white w-32">{quoteData.otherFees > 0 ? formatPrice(quoteData.otherFees) : '-'}</td>
                </tr>
                <tr>
                  <td className="text-right font-bold pr-2 py-1">TOTAL</td>
                  <td className="border border-black px-2 py-1 text-right bg-[#E8E8E8] font-bold w-32">{formatPrice(quoteData.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bank Details */}
          <div className="mt-8 text-sm space-y-1">
            <div className="flex"><span className="font-bold">Bank Account Details:</span> <span className="pl-2">Account Number: 0038965431</span></div>
            <div className="flex"><span className="font-bold">Account Name:</span> <span className="pl-2">Truck-view Global Enterprise</span></div>
            <div className="flex"><span className="font-bold">Bank:</span> <span className="pl-2">Stanbic IBTC</span></div>
          </div>
        </div>

        {/* Footer Catchphrase */}
        <div className="relative z-10 text-center mt-auto pt-8">
          <div className="text-[#D2691E] font-bold tracking-wider mb-2">THANK YOU FOR YOUR BUSINESS!</div>
          <div className="text-[#A52A2A] italic text-xl font-serif">Your driving pleasure is our clarion call!</div>
        </div>
        </div>
      </div>
    </div>
  );
}
