"use client";

import Slider from "react-slick";
import Image from "next/image";

const BRANDS = [
  { name: "EFG Hermes", logo: "/clients/br-efg.jpg" },
  { name: "Contactcars", logo: "/clients/br-contactcars.jpg" },
  { name: "ValU", logo: "/clients/br-valu.jpg" },
  { name: "El Abd", logo: "/clients/br-elabd.png" },
  { name: "Elite Solutions", logo: "/clients/br-elitessolutions.jpg" },
  { name: "Joint Scope", logo: "/clients/br-jointscope.jpg" },
  { name: "Balad", logo: "/clients/br-balad.jpg" },
  { name: "Furn", logo: "/clients/br-furn.jpg" },
  { name: "Moqa walat", logo: "/clients/br-moqawalat.jpg" },
  { name: "Alaqaar", logo: "/clients/br-alaqaar.jpg" },
  { name: "Jamjoom Pharma", logo: "/clients/br-jamjoom.jpg" },
];

export function ClientsSlider() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2200,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <div className="relative rounded-3xl border border-slate-800/80 bg-slate-950 px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.85)]">
      {/* top accent line */}
      <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

      <Slider {...settings}>
        {BRANDS.map((client) => (
          <div key={client.name} className="px-2">
            <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 transition hover:border-blue-500/70 hover:bg-slate-900">
              <Image
                src={client.logo}
                alt={client.name}
                width={180}
                height={70}
                className="h-auto w-auto max-h-16 object-contain"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

