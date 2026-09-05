/**
 * Datos de las páginas de servicio (/servicios/*).
 *
 * ⚠️ BORRADOR — el copy se derivó de las descripciones de servicio del portafolio
 * más un proceso estándar de 4 pasos. Revísalo, ajústalo a tu voz y añade tus
 * precios / plazos / entregables reales antes de publicar en serio.
 */

export interface Faq {
  q: string;
  a: string;
}

export interface ServicioLang {
  /** <title> (≈ 50-60 caracteres). */
  title: string;
  /** meta description (≈ 150-160 caracteres). */
  metaDescription: string;
  /** <h1> de la página. */
  h1: string;
  /** Nombre corto para migas de pan y tarjetas. */
  short: string;
  /** 2-3 frases: qué es y para quién. */
  intro: string;
  /** "Qué incluye" — 4-6 puntos. */
  includes: string[];
  /** "Cómo trabajo" — pasos (título: descripción). */
  process: string[];
  faq: Faq[];
}

export interface Servicio {
  /** Slug lógico (mismo en ES y EN, bajo /servicios/ y /en/servicios/). */
  slug: string;
  es: ServicioLang;
  en: ServicioLang;
}

const CIUDAD = 'Bogotá';

export const servicios: Servicio[] = [
  {
    slug: 'identidad-de-marca-bogota',
    es: {
      title: 'Diseño de identidad de marca en Bogotá | Alquimia Lab',
      metaDescription:
        'Diseño de identidad de marca y logotipo en Bogotá: logo, sistema visual y manual de marca. Para emprendedores y empresas de Colombia. Trabajo local y remoto.',
      h1: `Diseño de identidad de marca y logotipo en ${CIUDAD}`,
      short: 'Identidad de marca',
      intro:
        'Creo identidades de marca completas para emprendedores, marcas personales y pymes en Bogotá y toda Colombia. Desde el logotipo hasta el sistema visual y el manual de marca, para que tu negocio se vea coherente y reconocible en cualquier soporte.',
      includes: [
        'Sesión de descubrimiento para entender tu negocio, tu público y tu competencia.',
        'Diseño de logotipo principal, versiones secundarias e isotipo.',
        'Sistema visual: paleta de color, tipografías y elementos gráficos.',
        'Aplicaciones básicas (tarjeta, firma de correo, plantillas para redes).',
        'Manual de marca en PDF con las reglas de uso.',
        'Archivos finales en todos los formatos (vectorial, PNG, JPG).',
      ],
      process: [
        'Brief y descubrimiento: hablamos de tu negocio, objetivos y referencias.',
        'Concepto: propongo una o dos rutas creativas con racional de marca.',
        'Diseño y ajustes: desarrollo la ruta elegida con rondas de revisión.',
        'Entrega: manual de marca y archivos finales listos para usar.',
      ],
      faq: [
        {
          q: '¿Cuánto cuesta un proyecto de identidad de marca?',
          a: 'Depende del alcance (solo logotipo vs. identidad completa con manual y aplicaciones). Escríbeme con los detalles de tu proyecto y te envío una cotización en pesos colombianos sin compromiso.',
        },
        {
          q: '¿Cuánto tarda?',
          a: 'Una identidad de marca completa suele tomar de 3 a 5 semanas, según la rapidez de las revisiones y aprobaciones de tu parte.',
        },
        {
          q: '¿Trabajas con clientes fuera de Bogotá?',
          a: 'Sí. Trabajo con clientes de toda Colombia y del exterior; el proceso es 100% en línea, con reuniones por videollamada y entregas digitales.',
        },
        {
          q: '¿Qué archivos recibo al final?',
          a: 'Recibes el logotipo en formato vectorial (AI/SVG/PDF) y en PNG con fondo transparente, además del manual de marca en PDF.',
        },
      ],
    },
    en: {
      title: 'Brand identity design in Bogotá | Alquimia Lab',
      metaDescription:
        'Brand identity and logo design in Bogotá, Colombia: logo, visual system and brand guidelines. For founders and companies. Local and remote.',
      h1: `Brand identity & logo design in ${CIUDAD}`,
      short: 'Brand identity',
      intro:
        'I build complete brand identities for founders, personal brands and small businesses in Bogotá and across Colombia — from the logo to the visual system and brand guidelines, so your business looks coherent and recognizable everywhere.',
      includes: [
        'Discovery session to understand your business, audience and competitors.',
        'Primary logo, secondary versions and icon mark.',
        'Visual system: color palette, typography and graphic elements.',
        'Basic applications (business card, email signature, social templates).',
        'Brand guidelines PDF with usage rules.',
        'Final files in every format (vector, PNG, JPG).',
      ],
      process: [
        'Brief & discovery: your business, goals and references.',
        'Concept: one or two creative routes with brand rationale.',
        'Design & revisions: I develop the chosen route with review rounds.',
        'Handoff: brand guidelines and final files ready to use.',
      ],
      faq: [
        {
          q: 'How much does a brand identity project cost?',
          a: 'It depends on scope (logo only vs. full identity with guidelines and applications). Send me your project details and I will send a no-obligation quote.',
        },
        {
          q: 'How long does it take?',
          a: 'A full brand identity usually takes 3–5 weeks, depending on how quickly reviews and approvals happen on your side.',
        },
        {
          q: 'Do you work with clients outside Bogotá?',
          a: 'Yes. I work with clients across Colombia and abroad; the process is fully online, with video calls and digital deliverables.',
        },
        {
          q: 'What files do I get?',
          a: 'You get the logo in vector format (AI/SVG/PDF) and transparent PNG, plus the brand guidelines PDF.',
        },
      ],
    },
  },

  {
    slug: 'diseno-ui-ux-bogota',
    es: {
      title: 'Diseño UI/UX en Bogotá | Alquimia Lab',
      metaDescription:
        'Diseño UI/UX en Bogotá: investigación de usuarios, wireframes, interfaz y prototipos para webs y apps. Freelance para clientes de Colombia y en remoto.',
      h1: `Diseño UI/UX en ${CIUDAD}`,
      short: 'Diseño UI/UX',
      intro:
        'Diseño experiencias digitales intuitivas y centradas en el usuario: landing pages, sitios web y apps móviles. Incluye investigación, wireframing, diseño de interfaz y prototipado interactivo para validar antes de desarrollar.',
      includes: [
        'Investigación de usuarios y análisis de referentes.',
        'Arquitectura de información y flujos de usuario.',
        'Wireframes de baja y media fidelidad.',
        'Diseño de interfaz (UI) con sistema de componentes.',
        'Prototipo interactivo en Figma para pruebas.',
        'Entrega organizada para el equipo de desarrollo.',
      ],
      process: [
        'Descubrimiento: objetivos del producto, usuarios y restricciones.',
        'Estructura: flujos, arquitectura de información y wireframes.',
        'Interfaz: diseño visual, componentes y estados.',
        'Prototipo y handoff: prototipo navegable y archivos para desarrollo.',
      ],
      faq: [
        {
          q: '¿Diseñas también el desarrollo del sitio o la app?',
          a: 'Me encargo del diseño UI/UX y del prototipo. Puedo trabajar de la mano con tu equipo de desarrollo o recomendarte personas de confianza para la implementación.',
        },
        {
          q: '¿En qué herramienta entregas el diseño?',
          a: 'Trabajo en Figma. Recibes el archivo con los componentes, estilos y un prototipo interactivo listo para revisar y para pasar a desarrollo.',
        },
        {
          q: '¿Sirve para un MVP o producto pequeño?',
          a: 'Sí. Ajusto el alcance a la etapa de tu producto: desde una landing o un flujo puntual hasta el diseño completo de una app.',
        },
      ],
    },
    en: {
      title: 'UI/UX design in Bogotá | Alquimia Lab',
      metaDescription:
        'UI/UX design in Bogotá: user research, wireframes, interface and prototypes for websites and apps. Freelance for Colombian clients and remote.',
      h1: `UI/UX design in ${CIUDAD}`,
      short: 'UI/UX design',
      intro:
        'I design intuitive, user-centered digital experiences: landing pages, websites and mobile apps — research, wireframing, interface design and interactive prototyping so you can validate before building.',
      includes: [
        'User research and competitive analysis.',
        'Information architecture and user flows.',
        'Low- and mid-fidelity wireframes.',
        'Interface (UI) design with a component system.',
        'Interactive Figma prototype for testing.',
        'Organized handoff for the development team.',
      ],
      process: [
        'Discovery: product goals, users and constraints.',
        'Structure: flows, information architecture and wireframes.',
        'Interface: visual design, components and states.',
        'Prototype & handoff: navigable prototype and dev-ready files.',
      ],
      faq: [
        {
          q: 'Do you also build the site or app?',
          a: 'I handle UI/UX design and the prototype. I can work alongside your dev team or recommend trusted people for implementation.',
        },
        {
          q: 'Which tool do you deliver in?',
          a: 'I work in Figma. You get the file with components, styles and an interactive prototype ready for review and development.',
        },
        {
          q: 'Does it work for an MVP or small product?',
          a: 'Yes. I scope the work to your product stage: from a single landing or flow to a full app design.',
        },
      ],
    },
  },

  {
    slug: 'diseno-redes-sociales-bogota',
    es: {
      title: 'Diseño para redes sociales en Bogotá | Alquimia Lab',
      metaDescription:
        'Diseño para redes sociales en Bogotá: plantillas, piezas de campaña e historias con una identidad visual coherente. Para marcas de Colombia y en remoto.',
      h1: `Diseño para redes sociales en ${CIUDAD}`,
      short: 'Diseño para redes',
      intro:
        'Creo visuales para redes sociales que le dan a tu marca una voz reconocible y coherente: plantillas editables, gráficas de campaña, diseños de publicaciones e historias pensados para que tu comunidad conecte contigo.',
      includes: [
        'Definición de la línea gráfica para redes.',
        'Kit de plantillas editables (posts, carruseles, historias) en Canva o Figma.',
        'Piezas de campaña o lanzamiento.',
        'Guía rápida de uso para que tu equipo publique sin perder coherencia.',
        'Versiones para los formatos de cada red (feed, historias, reels).',
      ],
      process: [
        'Descubrimiento: marca, objetivos de comunicación y referentes.',
        'Concepto visual: propuesta de línea gráfica para redes.',
        'Producción: plantillas y piezas con rondas de ajuste.',
        'Entrega: archivos editables y guía de uso.',
      ],
      faq: [
        {
          q: '¿Me entregas plantillas que yo pueda editar después?',
          a: 'Sí. El objetivo es que quedes con un kit editable en Canva o Figma para que tu equipo publique de forma autónoma manteniendo la coherencia visual.',
        },
        {
          q: '¿Ofreces también gestión de contenido o community management?',
          a: 'Me enfoco en el diseño y en el sistema visual. Para la estrategia de contenido y publicación puedo recomendarte perfiles con los que trabajo.',
        },
        {
          q: '¿Sirve para cualquier red social?',
          a: 'Sí. Adapto las piezas a los formatos que uses: Instagram, Facebook, LinkedIn, TikTok o YouTube.',
        },
      ],
    },
    en: {
      title: 'Social media design in Bogotá | Alquimia Lab',
      metaDescription:
        'Social media design in Bogotá: templates, campaign assets and stories with a coherent visual identity. For Colombian brands and remote.',
      h1: `Social media design in ${CIUDAD}`,
      short: 'Social media design',
      intro:
        'I create social media visuals that give your brand a recognizable, coherent voice: editable templates, campaign graphics, post and story designs built so your community connects with you.',
      includes: [
        'Definition of your social visual style.',
        'Editable template kit (posts, carousels, stories) in Canva or Figma.',
        'Campaign or launch assets.',
        'Quick usage guide so your team can post consistently.',
        'Versions for each platform format (feed, stories, reels).',
      ],
      process: [
        'Discovery: brand, communication goals and references.',
        'Visual concept: proposed social style direction.',
        'Production: templates and assets with revision rounds.',
        'Handoff: editable files and usage guide.',
      ],
      faq: [
        {
          q: 'Do I get templates I can edit later?',
          a: 'Yes. You keep an editable kit in Canva or Figma so your team can post independently while keeping visual consistency.',
        },
        {
          q: 'Do you also do content management?',
          a: 'I focus on design and the visual system. For content strategy and posting I can recommend people I work with.',
        },
        {
          q: 'Does it work for any social network?',
          a: 'Yes. I adapt assets to the formats you use: Instagram, Facebook, LinkedIn, TikTok or YouTube.',
        },
      ],
    },
  },

  {
    slug: 'diseno-visual-y-editorial-bogota',
    es: {
      title: 'Diseño visual y editorial en Bogotá | Alquimia Lab',
      metaDescription:
        'Diseño visual y editorial en Bogotá: catálogos, revistas, presentaciones, empaques e ilustración para medios digitales e impresos. Colombia y remoto.',
      h1: `Diseño visual y editorial en ${CIUDAD}`,
      short: 'Diseño visual y editorial',
      intro:
        'Desarrollo piezas visuales creativas para medios digitales e impresos: diseño editorial (catálogos, revistas, informes, presentaciones), empaques, ilustración y motion graphics, siempre alineados con tu identidad de marca.',
      includes: [
        'Diseño y diagramación de piezas editoriales (impreso o digital).',
        'Diseño de empaque y etiqueta.',
        'Ilustración a medida para tu marca.',
        'Presentaciones y catálogos de producto.',
        'Preparación de archivos para imprenta o para publicación digital.',
      ],
      process: [
        'Brief: tipo de pieza, contenidos, formato y canal.',
        'Propuesta: retícula, estilo visual y muestra de páginas clave.',
        'Diagramación y ajustes: desarrollo completo con revisiones.',
        'Entrega: archivos finales listos para imprenta o digital.',
      ],
      faq: [
        {
          q: '¿Preparas los archivos para imprenta?',
          a: 'Sí. Entrego los archivos con marcas de corte, sangrados y perfil de color adecuados, y puedo coordinar con tu imprenta si lo necesitas.',
        },
        {
          q: '¿Haces ilustración original?',
          a: 'Sí. Puedo crear ilustraciones a medida para acompañar tu editorial, tu empaque o tus piezas de comunicación.',
        },
        {
          q: '¿Trabajas piezas de una sola página, como una infografía o un one-pager?',
          a: 'Claro. El alcance se ajusta a lo que necesites, desde una pieza puntual hasta un catálogo completo.',
        },
      ],
    },
    en: {
      title: 'Visual & editorial design in Bogotá | Alquimia Lab',
      metaDescription:
        'Visual and editorial design in Bogotá: catalogs, magazines, presentations, packaging and illustration for digital and print. Colombia and remote.',
      h1: `Visual & editorial design in ${CIUDAD}`,
      short: 'Visual & editorial design',
      intro:
        'I develop creative visual assets for digital and print: editorial design (catalogs, magazines, reports, presentations), packaging, illustration and motion graphics — always aligned with your brand identity.',
      includes: [
        'Editorial design and layout (print or digital).',
        'Packaging and label design.',
        'Custom illustration for your brand.',
        'Presentations and product catalogs.',
        'File prep for print or digital publishing.',
      ],
      process: [
        'Brief: type of piece, content, format and channel.',
        'Proposal: grid, visual style and sample key pages.',
        'Layout & revisions: full development with review rounds.',
        'Handoff: final files ready for print or digital.',
      ],
      faq: [
        {
          q: 'Do you prepare print-ready files?',
          a: 'Yes. I deliver files with proper crop marks, bleed and color profile, and can coordinate with your printer if needed.',
        },
        {
          q: 'Do you do original illustration?',
          a: 'Yes. I can create custom illustrations for your editorial, packaging or communication pieces.',
        },
        {
          q: 'Do you take on single-page pieces like an infographic or one-pager?',
          a: 'Of course. Scope adjusts to what you need, from a single piece to a full catalog.',
        },
      ],
    },
  },
];

export const getServicio = (slug: string) => servicios.find((s) => s.slug === slug);
