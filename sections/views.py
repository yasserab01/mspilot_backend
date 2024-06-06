from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Section, Subsection
from .serializers import SectionSerializer, SubsectionSerializer

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            section = serializer.save()
            subsections = request.data.get('subsections', [])
            for subsection in subsections:
                subsection_data = subsection.copy()
                subsection_data.pop('section', None)  # Remove the 'section' key if it exists
                Subsection.objects.create(section=section, **subsection_data)
            return Response({'status': 'success', 'message': 'Section and Subsections saved successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        section = self.get_object()
        print(section.subsections.all())
        section.subsections.all().delete()
        section.delete()
        return Response({'status': 'success', 'message': 'Section deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='subsections', url_name='subsections')
    def get_subsections(self, request, pk=None):
        section = self.get_object()
        subsections = Subsection.objects.filter(section=section)
        serializer = SubsectionSerializer(subsections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'], url_path='update-subsections', url_name='update_subsections')
    def update_subsections(self, request, pk=None):
        section = self.get_object()
        serializer = self.get_serializer(section, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            Subsection.objects.filter(section=section).delete()
            subsections = request.data.get('subsections', [])
            for subsection in subsections:
                subsection_data = subsection.copy()
                subsection_data.pop('section', None)  # Remove the 'section' key if it exists
                Subsection.objects.create(section=section, **subsection_data)
            return Response({'status': 'success', 'message': 'Section and Subsections updated successfully!'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], url_path='delete-subsections', url_name='delete_subsections')
    def delete_subsections(self, request, pk=None):
        section = self.get_object()
        Subsection.objects.filter(section=section).delete()
        return Response({'status': 'success', 'message': 'Subsections deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)
