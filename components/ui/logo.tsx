import Image from "next/image";

export default function Logo() {
  return (
    <div>
      <Image src="/images/logo.png" alt="AWA CYBER" width={100} height={100} />
    </div>
  );
}
