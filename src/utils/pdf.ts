/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InspectionReport } from '../types';
import { format } from 'date-fns';

export const generatePDF = async (report: InspectionReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- Header ---
  doc.setFillColor(15, 76, 129); // KSIA Corporate Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KING SALMAN INTERNATIONAL AIRPORT', 15, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ADMINISTRATIVE OFFICE HSE SAFETY INSPECTION REPORT', 15, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Workplace Health, Safety & Environment · ISO 45001:2018 & ISO 14001:2015 Standards', 15, 34);

  let y = 48;

  // --- Admin Section ---
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. AUDIT HEADER & OFFICE ADMINISTRATIVE CONTROL', 15, y);
  y += 7;

  const buildingVal = report.building || report.facility || 'KSIA Administrative Offices';
  const deptVal = report.department || 'Administrative Department';
  const floorVal = report.floor || 'Office Floor';
  const roomVal = report.officeRoom || report.zoneId || 'General Office Space';
  const wardenVal = report.safetyOfficer || report.deputyWarden || 'Floor Safety Warden';
  const extVal = report.contactExt || report.phoneExt || report.radioChannel || 'Internal Ext';

  autoTable(doc, {
    startY: y,
    head: [['Administrative Field', 'Inspection Record Details']],
    body: [
      ['Administrative Building / Complex', buildingVal],
      ['Department / Business Unit', deptVal],
      ['Floor / Level', floorVal],
      ['Office Suite / Room / Area', roomVal],
      ['Lead Inspector', `${report.leadInspector || 'Unassigned'} (Staff ID: ${report.staffId || 'N/A'}${report.badgeId ? `, Badge: ${report.badgeId}` : ''})`],
      ['Department / Office Manager', report.departmentManager || report.areaManagerSignatory || 'Designated Office Manager'],
      ['Inspection Date & Work Hours', `${report.inspectionDate} (${report.shift || 'Standard Business Hours'})`],
      ['Inspection Type', report.auditType || 'Routine Office HSE Inspection'],
      ['Office Safety Warden / HSE Contact', `${wardenVal} (Ext: ${extVal})`],
      ['Staff Consultation (ISO 45001 Cl. 5.4)', report.workersConsulted ? `Completed — ${report.consultationDetails || 'Consulted on-site office personnel'}` : 'Not Conducted / None Noted'],
      ['Assessment Reference Code', report.hazardAssessmentRef || `KSIA-OFC-${report.id.substring(0, 6).toUpperCase()}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 244, 248], textColor: [20, 40, 70], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.8 }
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // --- Systematic Modules ---
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SYSTEMATIC OFFICE INSPECTION MODULES', 15, y);
  y += 8;

  for (const module of report.modules) {
    // Check if module has any items with data
    const hasData = module.items.some(i => i.status !== null);
    if (!hasData) continue;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 76, 129);
    doc.text(`Module ${module.id}: ${module.title}`, 15, y);
    doc.setTextColor(20, 20, 20);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Ref', 'Checklist Item', 'Result', 'Likelihood', 'Impact', 'Risk', 'Priority', 'Office Location / Specific Finding']],
      body: module.items.map(i => {
        const ri = (i.likelihood && i.consequence) ? i.likelihood * i.consequence : null;
        const category = !ri ? (i.status === 'P' ? 'OK' : '-') : 
          ri <= 4 ? 'Low' : 
          ri <= 9 ? 'Medium' : 
          ri <= 15 ? 'High' : 'Critical';
        
        const statusLabel = i.status === 'P' ? 'PASS' : i.status === 'F' ? 'FAIL' : i.status === 'N/A' ? 'N/A' : '-';

        return [
          i.ref,
          i.item,
          statusLabel,
          i.likelihood || '-',
          i.consequence || '-',
          ri || '-',
          category,
          `${i.location ? `[${i.location}] ` : ''}${i.finding || (i.status === 'P' ? 'Meets safety standards' : 'No remarks')}`
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255] },
      styles: { fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 48 },
        2: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 14, halign: 'center' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 10, halign: 'center' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 'auto' }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- Risk Matrix Legend ---
  if (y > 225) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. OFFICE RISK SEVERITY & ACTION TIMELINES', 15, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Risk Score', 'Classification', 'Description & Target Action SLA']],
    body: [
      ['1 - 4', 'LOW (ROUTINE)', 'Minor housekeeping or aesthetic item. Rectify during regular maintenance (within 5 business days).'],
      ['5 - 9', 'MEDIUM (MODERATE)', 'Potential discomfort or trip risk. Corrective work order within 48 to 72 hours.'],
      ['10 - 15', 'HIGH (URGENT)', 'Clear safety hazard (e.g. trailing power cable, blocked fire exit). Action within 24 hours.'],
      ['16 - 25', 'CRITICAL (IMMEDIATE)', 'Immediate danger (exposed electrical wires, active water leak near power). Stop use & isolate area immediately.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 244, 248], textColor: [0, 0, 0] },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold' }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // --- CAP Section ---
  if (report.correctiveActions.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('4. CORRECTIVE ACTION PLAN (CAP) & ASSIGNMENTS', 15, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Item Ref', 'Office Defect / Hazard', 'Level', 'Immediate Remedial Action', 'Responsible Party', 'Target SLA']],
      body: report.correctiveActions.map(ca => [
        ca.id,
        `${ca.location ? `[${ca.location}] ` : ''}${ca.defect}`,
        ca.severity || 'L1',
        ca.containment || 'Immediate containment applied on-site',
        ca.owner || 'Facilities / Dept Coordinator',
        ca.targetSla || '48 Hours'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [180, 40, 40], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 }
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // --- Final Sign-off ---
  if (y > 215) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('5. FINAL AUDIT SUMMARY & FORMAL SIGN-OFF', 15, y);
  y += 7;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const declaration = "I hereby confirm that this Health, Safety, and Environment (HSE) inspection was systematically performed across the designated airport administrative office premises in conformance with KSIA HSE Manual and ISO 45001:2018 guidelines. Identified hazards have been recorded in the Corrective Action Plan and communicated to the Department Manager and Facilities Management for resolution.";
  const splitText = doc.splitTextToSize(declaration, pageWidth - 30);
  doc.text(splitText, 15, y);
  y += (splitText.length * 4.5) + 8;

  const signoffBody = [
    ['Lead Office HSE Inspector', report.leadSignatory || report.leadInspector || '_______________________', format(new Date(), 'dd/MM/yyyy HH:mm')],
    ['Department / Office Manager', report.areaManagerSignatory || report.departmentManager || '_______________________', '____/____/2026'],
    ['KSIA HSE Safety Manager', report.chiefSignatory || '_______________________', '____/____/2026']
  ];

  autoTable(doc, {
    startY: y,
    head: [['Role / Authority', 'Printed Name & Electronic Verification', 'Sign-Off Date']],
    body: signoffBody,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 4 }
  });

  // --- Photo Appendix ---
  const allPhotos: { ref: string, photo: string }[] = [];
  report.modules.forEach(m => {
    m.items.forEach(i => {
      i.photos.forEach(p => {
        allPhotos.push({ ref: i.ref, photo: p });
      });
    });
  });

  if (allPhotos.length > 0) {
    doc.addPage();
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('APPENDIX: OFFICE INSPECTION PHOTO EVIDENCE', 15, 20);
    
    let photoY = 30;
    let photoX = 15;
    const photoWidth = 85;
    const photoHeight = 60;

    allPhotos.forEach((item, index) => {
      if (photoY > 220) {
        doc.addPage();
        photoY = 20;
      }

      try {
        doc.addImage(item.photo, 'JPEG', photoX, photoY, photoWidth, photoHeight);
        doc.setFontSize(8);
        doc.text(`Ref: ${item.ref}`, photoX, photoY + photoHeight + 5);
      } catch (e) {
        console.error('Failed to add image to PDF', e);
      }

      if (index % 2 === 0) {
        photoX = 110;
      } else {
        photoX = 15;
        photoY += 80;
      }
    });
  }

  // --- Footer ---
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `KSIA HSE ADMINISTRATIVE OFFICE SAFETY REPORT | ID: ${report.id.substring(0, 8)} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  const sanitizedFileName = (report.department || report.officeRoom || report.building || 'Office_Inspection')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`KSIA_OFFICE_HSE_REPORT_${sanitizedFileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
