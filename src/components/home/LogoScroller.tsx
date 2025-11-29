import Image from "next/image"
import Marquee from "react-fast-marquee"

const LogoScroller = () => {
  const logos = [
    { name: "Google", src: "/logos/google.png?height=80&width=240" },
    { name: "Netflix", src: "/logos/Netflix.png?height=80&width=240" },
    { name: "Apple", src: "/logos/apple.png?height=80&width=240" },
    { name: "Paypal", src: "/logos/paypal.png?height=80&width=240" },
    { name: "Microsoft", src: "/logos/microsoft.png?height=80&width=240" },
    { name: "Amazon", src: "/logos/amazon.png?height=80&width=240" },
    { name: "LinkedIn", src: "/logos/linkedin.png?height=80&width=240" },
    { name: "Meta", src: "/logos/meta.png?height=80&width=240" },
    { name: "Slack", src: "/logos/slack.png?height=80&width=240" },
    { name: "Spotify", src: "/logos/spotify.png?height=80&width=240" },
    { name: "Tesla", src: "/logos/tesla.png?height=80&width=240" },
  ];

  return (
    <div className="py-4 w-full">
      <Marquee
        speed={40}
        gradient={true}
        gradientColor="#343B4A"
        gradientWidth={50}
        pauseOnHover={false}
      >
        {logos.map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-6 sm:mx-10 md:mx-16 opacity-90 hover:opacity-100 transition-all duration-300"
          >
            <Image
              src={logo.src || "/placeholder.svg"}
              alt={`${logo.name} logo`}
              width={240}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default LogoScroller;
