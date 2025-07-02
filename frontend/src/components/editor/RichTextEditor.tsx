import { useState } from 'react'
import { 
  BoldIcon, 
  ItalicIcon, 
  ListBulletIcon, 
  NumberedListIcon,
  LinkIcon 
} from '@heroicons/react/24/outline'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    const editor = document.getElementById('editor')
    if (editor) {
      onChange(editor.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    const editor = document.getElementById('editor')
    if (editor) {
      onChange(editor.innerHTML)
    }
  }

  const handleInput = () => {
    const editor = document.getElementById('editor')
    if (editor) {
      onChange(editor.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl)
      setLinkUrl('')
      setIsLinkModalOpen(false)
    }
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex items-center space-x-2">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          title="Bold"
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          title="Italic"
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          title="Bullet List"
        >
          <ListBulletIcon className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          title="Numbered List"
        >
          <NumberedListIcon className="h-4 w-4" />
        </button>
        
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
        
        <button
          type="button"
          onClick={() => setIsLinkModalOpen(true)}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
      
      <div
        id="editor"
        contentEditable
        className="p-3 min-h-[150px] focus:outline-none prose prose-sm dark:prose-invert max-w-none"
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />

      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-96">
            <h3 className="text-lg font-medium mb-3">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="input w-full mb-3"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false)
                  setLinkUrl('')
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="btn btn-primary btn-sm"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}