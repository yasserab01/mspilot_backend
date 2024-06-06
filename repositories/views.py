from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Repository
from .serializers import RepositorySerializer
from django.shortcuts import get_object_or_404

class RepositoryViewSet(viewsets.ModelViewSet):
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            repository = serializer.save()
            sections = request.data.get('sections', [])
            repository.sections.add(*sections)
            return Response({'status': 'success', 'message': 'Repository saved successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        repository = get_object_or_404(Repository, pk=pk)
        serializer = RepositorySerializer(repository)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_sections(self, request, pk=None):
        repository = self.get_object()
        section_ids = request.data.get('sections', [])
        repository.sections.set(section_ids)
        return Response({'status': 'success', 'message': 'Sections updated successfully'})

    def destroy(self, request, pk=None):
        repository = self.get_object()
        repository.delete()
        return Response({'status': 'success', 'message': 'Repository deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
