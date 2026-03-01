import { QRCodeSVG } from 'qrcode.react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QrCode } from 'lucide-react'

export function QRCodeDisplay({ code, label }: { code: string; label?: string }) {
  const joinUrl = `${window.location.origin}/join/${code}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <QrCode className="h-3.5 w-3.5" />
          QR
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">{label || 'Scan to Join'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-xl bg-white p-4">
            <QRCodeSVG value={joinUrl} size={200} />
          </div>
          <p className="text-center font-mono text-sm tracking-widest font-semibold">{code}</p>
          <p className="text-center text-xs text-muted-foreground">
            Scan QR or enter the code on the home screen
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
