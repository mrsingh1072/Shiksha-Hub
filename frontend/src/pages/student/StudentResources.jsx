import { useEffect, useState } from 'react'
import {
  FolderOpen,
  FileText,
  File,
  Image,
  Video,
  Download,
} from 'lucide-react'

import { getStudentResources } from '../../services/studentDashboardService'

export default function StudentResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      const data = await getStudentResources()
      setResources(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const BASE_URL = 'http://127.0.0.1:8000'

  const typeIcon = {
    PDF: FileText,
    PPT: FileText,
    PPTX: FileText,
    DOC: FileText,
    DOCX: FileText,
    PNG: Image,
    JPG: Image,
    JPEG: Image,
    VIDEO: Video,
  }

  const typeColor = {
    PDF: '#dc2626',
    PPT: '#ea580c',
    PPTX: '#ea580c',
    DOC: '#2563eb',
    DOCX: '#2563eb',
    PNG: '#059669',
    JPG: '#059669',
    JPEG: '#059669',
    VIDEO: '#7c3aed',
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">
          Learning Resources
        </h1>

        <p className="mt-2 text-gray-500">
          Access study materials uploaded by your teachers.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-green-primary/10 bg-white p-12 text-center">
          <FolderOpen className="mx-auto h-14 w-14 text-green-primary" />

          <h2 className="mt-4 text-xl font-bold">
            No Resources Available
          </h2>

          <p className="mt-2 text-gray-500">
            Your teachers haven't uploaded any learning resources yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = typeIcon[resource.file_type] || File
            const color = typeColor[resource.file_type] || '#64748b'

            return (
              <div
                key={resource._id}
                className="rounded-2xl bg-white border border-green-primary/10 shadow-sm overflow-hidden"
              >
                {resource.file_type === 'VIDEO' && (
                  <video
                    controls
                    preload="metadata"
                    className="w-full h-52 object-cover bg-black"
                  >
                    <source
                      src={`${BASE_URL}/teacher/resources/file/${resource.stored_name}`}
                      type="video/mp4"
                    />
                  </video>
                )}

                <div className="p-5">
                  {resource.file_type !== 'VIDEO' && (
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: color + '15',
                      }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color }}
                      />
                    </div>
                  )}

                  <h2 className="font-bold text-lg">
                    {resource.title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {resource.description || 'No description provided'}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Teacher:</span>{' '}
                      {resource.teacher_name}
                    </p>

                    <p>
                      <span className="font-semibold">Type:</span>{' '}
                      {resource.file_type}
                    </p>

                    <p>
                      <span className="font-semibold">Size:</span>{' '}
                      {formatSize(resource.file_size)}
                    </p>

                    <p>
                      <span className="font-semibold">Uploaded:</span>{' '}
                      {new Date(resource.created_at).toLocaleString()}
                    </p>
                  </div>

                  <a
                    href={`${BASE_URL}/teacher/resources/file/${resource.stored_name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-primary px-4 py-2 text-white hover:bg-green-secondary transition"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}