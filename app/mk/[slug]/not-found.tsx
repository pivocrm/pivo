export default function MediaKitNotFound() {
  return (
    <div className="min-h-screen bg-[#F0F7EC] flex flex-col items-center justify-center p-6 text-center">
      <span className="text-5xl mb-4">🦎</span>
      <h1 className="font-nunito text-2xl font-black text-[#1A2547] mb-2">
        Media Kit não encontrado
      </h1>
      <p className="text-[#5A6A82]">
        Este link pode estar desatualizado ou o criador desativou o acesso público.
      </p>
    </div>
  );
}
