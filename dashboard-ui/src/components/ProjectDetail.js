import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingStory, setProcessingStory] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchScenes();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchScenes = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/scenes`);
      if (response.ok) {
        const data = await response.json();
        setScenes(data.scenes || []);
      }
    } catch (error) {
      console.error('Error fetching scenes:', error);
    }
    setLoading(false);
  };

  const processStory = async () => {
    setProcessingStory(true);
    try {
      const response = await fetch(`/api/v1/processing/process-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: id,
          story_text: project.story_text
        }),
      });

      if (response.ok) {
        // Refresh scenes after processing
        await fetchScenes();
      }
    } catch (error) {
      console.error('Error processing story:', error);
    }
    setProcessingStory(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          Project not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {project.title}
            </h1>
            <p className="text-gray-600">{project.description}</p>
            <div className="flex items-center space-x-4 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
              <span className="text-sm text-gray-500">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <button
            onClick={processStory}
            disabled={processingStory}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {processingStory ? '🔄 Processing...' : '🤖 Process Story'}
          </button>
        </div>

        {project.story_text && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Story Text</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {project.story_text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Scenes Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          🎬 Scenes ({scenes.length})
        </h2>
        
        {scenes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No scenes yet. Process your story to generate scenes automatically.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {scenes.map((scene, index) => (
              <div key={scene.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Scene {scene.scene_number}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    scene.status === 'completed' ? 'bg-green-100 text-green-800' :
                    scene.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {scene.status}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm mb-4">{scene.description}</p>
                    
                    <h4 className="font-medium text-gray-700 mb-2">Characters</h4>
                    <p className="text-gray-600 text-sm">{scene.characters || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Setting</h4>
                    <p className="text-gray-600 text-sm mb-4">{scene.setting || 'Not specified'}</p>
                    
                    <h4 className="font-medium text-gray-700 mb-2">Mood</h4>
                    <p className="text-gray-600 text-sm">{scene.mood || 'Not specified'}</p>
                  </div>
                </div>

                {scene.video_url && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-700 mb-2">Generated Video</h4>
                    <video controls className="w-full max-w-md rounded-lg">
                      <source src={scene.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
