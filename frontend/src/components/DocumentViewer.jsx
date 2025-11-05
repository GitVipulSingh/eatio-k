// Component for viewing documents with smart handling of different formats
import { useState } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  Alert,
  IconButton,
  Chip
} from '@mui/material'
import { 
  XMarkIcon, 
  DocumentIcon, 
  EyeIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline'

const DocumentViewer = ({ open, onClose, documentUrl, documentName, documentType = 'Document' }) => {
  const [imageError, setImageError] = useState(false)

  // Debug logging
  console.log('DocumentViewer props:', { documentUrl, documentName, documentType })

  const isCloudinaryUrl = documentUrl?.includes('cloudinary.com')
  const isImageFile = documentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdfFile = documentUrl?.match(/\.pdf$/i) || documentUrl?.includes('/image/upload/') && documentUrl?.includes('.pdf')
  const isLegacyFilename = documentUrl && !documentUrl.startsWith('http')

  // Additional check for Cloudinary PDF URLs that might not have .pdf extension
  const isCloudinaryPdf = isCloudinaryUrl && (
    isPdfFile || 
    documentUrl?.includes('fl_attachment') || 
    documentUrl?.includes('resource_type/raw') ||
    documentUrl?.includes('/raw/upload/') ||
    documentName?.toLowerCase().includes('pdf') ||
    documentType?.toLowerCase().includes('fssai') ||
    documentType?.toLowerCase().includes('license')
  )

  console.log('File type detection:', { 
    isCloudinaryUrl, 
    isImageFile, 
    isPdfFile, 
    isCloudinaryPdf, 
    isLegacyFilename,
    documentUrl 
  })

  const handleOpenInNewTab = () => {
    if (isCloudinaryUrl) {
      let urlToOpen = documentUrl
      
      // If it's a PDF but the URL doesn't look right, try to fix it
      if ((isPdfFile || isCloudinaryPdf) && documentUrl.includes('/image/upload/')) {
        // Convert image URL to raw URL for PDFs
        urlToOpen = documentUrl.replace('/image/upload/', '/raw/upload/')
        console.log('Converted PDF URL:', urlToOpen)
      }
      
      window.open(urlToOpen, '_blank')
    }
  }

  const renderDocumentContent = () => {
    if (isLegacyFilename) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Legacy Document</strong>
          </Typography>
          <Typography variant="body2">
            This document was uploaded before cloud storage was implemented. 
            The filename is: <strong>{documentUrl}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            To view this document, please ask the restaurant to re-upload it through their dashboard.
          </Typography>
        </Alert>
      )
    }

    if (!isCloudinaryUrl) {
      return (
        <Alert severity="info">
          <Typography variant="body2">
            Document URL: {documentUrl}
          </Typography>
        </Alert>
      )
    }

    if (isImageFile && !imageError) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={documentUrl}
            alt={documentName}
            sx={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: 1,
              boxShadow: 2
            }}
            onError={() => setImageError(true)}
          />
        </Box>
      )
    }

    if (isPdfFile || isCloudinaryPdf || imageError) {
      // Try to embed PDF first, fallback to open in new tab
      if ((isPdfFile || isCloudinaryPdf) && isCloudinaryUrl) {
        return (
          <Box>
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                PDF Document
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                onClick={handleOpenInNewTab}
                sx={{ mb: 2 }}
              >
                Open in New Tab
              </Button>
            </Box>
            <Box
              component="iframe"
              src={`${documentUrl.includes('/image/upload/') ? documentUrl.replace('/image/upload/', '/raw/upload/') : documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              sx={{
                width: '100%',
                height: '60vh',
                border: '1px solid #ddd',
                borderRadius: 1,
              }}
              title={documentName || 'PDF Document'}
              onError={(e) => {
                console.error('PDF iframe failed to load:', e)
                // Fallback to button-only view
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <Box sx={{ textAlign: 'center', py: 4, display: 'none' }}>
              <DocumentIcon className="h-16 w-16 mx-auto mb-3 text-gray-400" />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                PDF preview not available. Click "Open in New Tab" to view the document.
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                onClick={handleOpenInNewTab}
              >
                Open in New Tab
              </Button>
            </Box>
          </Box>
        )
      }

      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <DocumentIcon className="h-16 w-16 mx-auto mb-3 text-gray-400" />
          <Typography variant="h6" sx={{ mb: 2 }}>
            {(isPdfFile || isCloudinaryPdf) ? 'PDF Document' : 'Document Preview'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {(isPdfFile || isCloudinaryPdf)
              ? 'Click "Open in New Tab" to view the PDF document'
              : 'Preview not available. Click "Open in New Tab" to view the document'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
            onClick={handleOpenInNewTab}
          >
            Open in New Tab
          </Button>
        </Box>
      )
    }

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <DocumentIcon className="h-16 w-16 mx-auto mb-3 text-gray-400" />
        <Typography variant="body2" color="text.secondary">
          Document preview not available
        </Typography>
      </Box>
    )
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            {documentType}
          </Typography>
          {isCloudinaryUrl && (
            <Chip 
              label="Cloudinary" 
              size="small" 
              color="success" 
              variant="outlined"
            />
          )}
          {isLegacyFilename && (
            <Chip 
              label="Legacy" 
              size="small" 
              color="warning" 
              variant="outlined"
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {documentName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {documentName}
          </Typography>
        )}
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
            <Typography variant="caption" component="div">
              <strong>Debug Info:</strong><br/>
              URL: {documentUrl}<br/>
              Is Cloudinary: {isCloudinaryUrl ? 'Yes' : 'No'}<br/>
              Is PDF: {(isPdfFile || isCloudinaryPdf) ? 'Yes' : 'No'}<br/>
              Is Image: {isImageFile ? 'Yes' : 'No'}
            </Typography>
          </Alert>
        )}
        
        {renderDocumentContent()}
      </DialogContent>
      
      <DialogActions>
        {isCloudinaryUrl && (
          <Button
            startIcon={<EyeIcon className="h-4 w-4" />}
            onClick={handleOpenInNewTab}
          >
            Open in New Tab
          </Button>
        )}
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentViewer