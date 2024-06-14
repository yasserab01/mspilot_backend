from reportlab.pdfbase.pdfmetrics import stringWidth
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Report, SubsectionStatus
from .serializers import ReportSerializer, SubsectionStatusSerializer
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import simpleSplit
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Report

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='subsections-status', url_name='subsections-status')
    def get_subsections_status(self, request, pk=None):
        report = self.get_object()
        subsection_statuses = SubsectionStatus.objects.filter(report=report)
        serializer = SubsectionStatusSerializer(subsection_statuses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='update-subsections-status', url_name='update-subsections-status')
    def update_subsections_status(self, request, pk=None):
        errors = []
        for subsection_status_data in request.data:
            if 'id' not in subsection_status_data or not subsection_status_data['id']:
                errors.append({'id': subsection_status_data.get('id'), 'error': 'Invalid ID'})
                continue

            try:
                subsection_status = SubsectionStatus.objects.get(id=subsection_status_data['id'])
                subsection_status.status = subsection_status_data['status']
                subsection_status.justification = subsection_status_data['justification']
                subsection_status.save()
            except SubsectionStatus.DoesNotExist:
                errors.append({'id': subsection_status_data['id'], 'error': 'SubsectionStatus not found'})

        if errors:
            return Response({'status': 'failure', 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': 'success', 'message': 'Subsections status updated successfully'})

    @action(detail=True, methods=['post'], url_path='subsections', url_name='subsections')
    def add_subsections(self, request, pk=None):
        report = self.get_object()
        for subsection_data in request.data.get('subsections', []):
            SubsectionStatus.objects.create(
                report=report,
                subsection_id=subsection_data['id'],
                status=subsection_data['status'],
                justification=subsection_data['justification']
            )
        return Response({'status': 'success', 'message': 'Subsections added successfully'})

    @action(detail=True, methods=['delete'], url_path='remove-report', url_name='remove-report')
    def remove_report(self, request, pk=None):
        report = self.get_object()
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PDFReport(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        report_id = request.data.get('report_id')
        filename = request.data.get('filename', 'default_filename.pdf')

        try:
            report = Report.objects.select_related('repository').prefetch_related(
                'subsectionstatus_set__subsection').get(id=report_id)
        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        Story = []

        styles = getSampleStyleSheet()
        table_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ])

        report_title = Paragraph(f"Report for {report.company} - Repository {report.repository}", styles['Title'])
        Story.append(report_title)
        Story.append(Spacer(1, 0.2 * inch))

        subsection_statuses = {status.subsection.id: status for status in report.subsectionstatus_set.all()}

        for section in report.repository.sections.all():
            data = [[Paragraph("Section", styles['Heading4']),
                     Paragraph("Subsection", styles['Heading4']),
                     Paragraph("Status", styles['Heading4']),
                     Paragraph("Justification", styles['Heading4'])]]
            column_widths = [1.5 * inch, 1.5 * inch, 1.2 * inch, 3 * inch]  # Predefined column widths

            for subsection in section.subsections.all():  # Use the correct related_name
                status = subsection_statuses.get(subsection.id)
                if status:
                    subsection_id = f"{section.id}-{subsection.id}"
                    row = [
                        Paragraph(subsection_id, styles['BodyText']),
                        Paragraph(subsection.name, styles['BodyText']),
                        Paragraph(status.status, styles['BodyText']),
                        Paragraph(status.justification, styles['BodyText'])
                    ]
                else:
                    row = [
                        Paragraph(subsection.name, styles['BodyText']),
                        Paragraph('N/A', styles['BodyText']),
                        Paragraph('No data', styles['BodyText']),
                        ''
                    ]
                data.append(row)

            t = Table(data, colWidths=column_widths)  # Use predefined column widths
            t.setStyle(table_style)
            Story.append(t)
            Story.append(Spacer(1, 0.2 * inch))

        doc.build(Story)
        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response