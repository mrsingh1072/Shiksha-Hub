import { useEffect, useState } from 'react'
import { Camera, Trash2, Upload } from 'lucide-react'
import api from '../../services/api'

function resolvePhotoUrl(path) {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('blob:')) return path
  return `http://127.0.0.1:8000${path}`
}

async function fetchAuthenticatedPhoto(path) {
  const response = await api.get(path, { responseType: 'blob' })
  return URL.createObjectURL(response.data)
}

export default function ProfilePhotoUpload({ profilePhoto, onUploaded, onRemoved }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [savedUrl, setSavedUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false

    async function loadPhoto() {
      if (!profilePhoto) {
        setSavedUrl('')
        return
      }

      try {
        objectUrl = await fetchAuthenticatedPhoto(profilePhoto)
        if (!cancelled) setSavedUrl(objectUrl)
      } catch {
        if (!cancelled) setSavedUrl('')
      }
    }

    loadPhoto()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [profilePhoto])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const displayUrl = previewUrl || savedUrl

  const handleSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatus('Please choose a JPG, PNG, or WEBP image.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatus('Image must be 2MB or smaller.')
      return
    }

    const nextPreview = URL.createObjectURL(file)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(nextPreview)
    setSelectedFile(file)
    setStatus('')
  }

  const handleSave = async () => {
    if (!selectedFile) return
    setIsBusy(true)
    setStatus('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const response = await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSelectedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
      setStatus('Profile photo updated.')
      onUploaded?.(response.data.profilePhoto)
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Unable to upload photo.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleRemove = async () => {
    setIsBusy(true)
    setStatus('')

    try {
      await api.delete('/profile/photo')
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (savedUrl) URL.revokeObjectURL(savedUrl)
      setPreviewUrl('')
      setSavedUrl('')
      setSelectedFile(null)
      setStatus('Profile photo removed.')
      onRemoved?.()
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Unable to remove photo.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-green-primary/10 bg-cream shadow-inner">
        {displayUrl ? (
          <img src={displayUrl} alt="Profile preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
            No photo
          </div>
        )}
        <label className="absolute bottom-2 right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-green-primary text-white shadow-lg">
          <Camera className="h-4 w-4" />
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleSelect} />
        </label>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <p className="text-sm font-bold text-text">Profile photo</p>
          <p className="text-sm text-gray-500">Upload a clear photo. Preview before saving.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-green-primary/15 bg-white px-4 py-2 text-sm font-bold text-green-primary transition hover:bg-green-primary/5">
            <Upload className="h-4 w-4" />
            Choose image
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleSelect} />
          </label>
          {selectedFile && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isBusy}
              className="rounded-xl bg-green-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {isBusy ? 'Saving...' : 'Save photo'}
            </button>
          )}
          {(profilePhoto || selectedFile) && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
        {status && <p className="text-sm font-semibold text-green-primary">{status}</p>}
      </div>
    </div>
  )
}

export { resolvePhotoUrl }
