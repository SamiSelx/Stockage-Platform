import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Copy, Check, Link2, FileIcon, Lock, Eye, EyeOff, Search, User, Mail, X } from 'lucide-react'
import { useGetAllUsersQuery } from '@/app/backend/endpoints/user'
import { useShareFileMutation } from '@/app/backend/endpoints/file'
import { encryptFKForUser, importPublicKey, restoreRMKFromSession, unwrapFileKey } from '@/utils/crypto'
import uint8ToBase64, { base64ToUint8Array } from '@/utils/convertBase64'


interface ShareFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  fileId: string;
  encryptedFK: string;
  fk_iv:string
}

export function ShareFileDialog({
  open,
  onOpenChange,
  fileName,
  fileId,
  encryptedFK,
  fk_iv
}: ShareFileDialogProps) {
    const [users, setUsers] = useState<UserI[]>([])
    const {data: usersData} = useGetAllUsersQuery()
    // const users = usersData?.data || []
    console.log("user", users,fileId);
    const [shareFile] = useShareFileMutation()
    
  const [copied, setCopied] = useState<'link' | 'key' | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<UserI[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'sharing'>('search')

  // Generate share link and encryption key
  const shareLink = `https://cryptodrive.app/shared/${fileId}`
  const encryptionKey = `enc_${fileId}_${Math.random().toString(36).substring(2, 15)}`

  useEffect(()=>{
    if(usersData?.data){
        setUsers(usersData?.data)
    }
  },[usersData?.data])

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    return users.filter(user =>
      (user.firstName + " " + user.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, users])

  // Users already selected
  const availableUsers = filteredUsers.filter(user => !selectedUsers.some(s => s._id === user._id))

  // const handleSelectUser = (user: UserI) => {
  //   setSelectedUsers([...selectedUsers, user])
  //   setSearchQuery('')
  // }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId))
  }

  const handleCopy = (text: string, type: 'link' | 'key') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleShareFile(user: UserI) {
   try{
 const rmk = await restoreRMKFromSession();
 console.log("rrmm ",rmk)
            if (!rmk)
              throw new Error("Please log in again.");

            console.log("encrypted FK",encryptedFK, "fk iv", user);
            
    
            // unwrap the file key
            const fileKey = await unwrapFileKey(
              base64ToUint8Array(encryptedFK),
              rmk,
              base64ToUint8Array(fk_iv),
            );
            const publicKey = await importPublicKey(base64ToUint8Array(user.publicKey));
            const encryptedFKForRecipient = await encryptFKForUser(fileKey, publicKey);

    shareFile({ fileId, recipientId: user._id, encryptedFK: uint8ToBase64(encryptedFKForRecipient) })
        .unwrap()
        .then(data => {
            console.log("File shared successfully:", data);
        })
        .catch(error => {
            console.error("Error sharing file:", error);
        });
   }catch(err){
        console.error("Error sharing file:", err)
   }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share File</DialogTitle>
          <DialogDescription className="text-base pt-1">
            Share &quot;{fileName}&quot; securely - recipients view from your drive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* File Info */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">Ready to share</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Find People
            </button>
            <button
              onClick={() => setActiveTab('sharing')}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === 'sharing'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Access Details
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/60 border-border focus:border-primary/50"
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">
                    SHARING WITH ({selectedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user._id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30"
                      >
                        {/* <span className="text-sm">{user.avatar}</span> */}
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{user.lastName + " " + user.firstName}</p>
                          <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="ml-1 rounded hover:bg-primary/20 p-0.5 transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* User Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableUsers.length > 0 ? (
                  availableUsers.map(user => (
                    <Card
                      key={user._id}
                      className="p-3 bg-background hover:bg-secondary/50 border-border hover:border-primary/30 transition-colors cursor-pointer"
                      // onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* <span className="text-lg">{user.avatar}</span> */}
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.lastName + " " + user.firstName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={()=> handleShareFile(user)}
                        >
                          Share
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : searchQuery ? (
                  <div className="text-center py-8">
                    <User className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Search for a person to share with
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Sharing Details Tab
            <div className="space-y-6">
              {/* Share Link */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  Share Link
                </label>
                <Card className="p-4 bg-muted/40 border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground flex-1 truncate bg-background/50 px-3 py-2 rounded">
                      {shareLink}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(shareLink, 'link')}
                      className="flex-shrink-0 h-8 w-8"
                    >
                      {copied === 'link' ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Encryption Key */}
              <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Encryption Key
                </label>
                <Card className="p-4 bg-background border-border">
                  <div className="flex items-center gap-2">
                    <code className={`text-xs font-mono flex-1 truncate px-3 py-2 rounded ${
                      showKey ? 'text-foreground bg-background/50' : 'text-muted-foreground bg-background/50 blur-sm'
                    }`}>
                      {showKey ? encryptionKey : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                      className="flex-shrink-0 h-8 w-8"
                      title={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(encryptionKey, 'key')}
                      className="flex-shrink-0 h-8 w-8"
                    >
                      {copied === 'key' ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Info Box */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <p className="text-xs text-blue-900 dark:text-blue-200">
                  <strong>How it works:</strong> Share the link and key separately for security. Recipients need both to access your file from your drive.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
            {activeTab === 'search' && selectedUsers.length > 0 && (
              <Button
                onClick={() => setActiveTab('sharing')}
                className="flex-1"
              >
                Continue to Access Details
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
