export type Lang = "fr" | "en" | "es" | "de" | "it" | "pt" | "ja" | "ko" | "zh" | "ar";

export const WELCOME =
  "Bonjour et bienvenue chez Powertech The Future ! ✨ Je suis Angel, l'assistante IA de Thomas. Je suis ravie de faire votre connaissance. Comment puis-je vous appeler, et quel projet web, outil Python ou opportunité tech souhaiteriez-vous réaliser avec nous aujourd'hui ?";

export type Reco = "starter" | "pro" | "enterprise" | "recruit";

export type Copy = {
  askName: string;
  askNeed: (name: string) => string;
  askFeatures: string;
  askDelay: string;
  askEmail: string;
  askCompany: (name: string) => string;
  askRole: string;
  recruitOpen: string;
  price: string;
  summaryHello: (name: string) => string;
  labels: { need: string; features: string; delay: string; email: string; company: string; role: string };
  rec: Record<Reco, string>;
  studioLead: string;
  studioSteps: string[];
  studioPrompt: (brief: string) => string;
  quick: { label: string; text: string }[];
};

const PRICE_FR = `Offres officielles de Powertech The Future :
• Starter — automatisation, script Python ou landing : 149 €
• Pro — système complet web + IA, le plus choisi : 397 € (ou 2x 209 €)
• Enterprise — architecture sur-mesure : 797 €
• Hébergement, maintenance & évolution IA : 49 € / mois
• Mission ou recrutement tech : TJM 350 € / jour`;

function promptBlock(lines: string[]): string {
  return lines.join("\n");
}

export const COPY: Record<Lang, Copy> = {
  fr: {
    askName: "Comment puis-je vous appeler ?",
    askNeed: (name) =>
      name
        ? `Enchantée ${name}. En une phrase, que voulez-vous construire : un script Python, un site, un système complet avec assistant IA, ou une mission ?`
        : "En une phrase, que voulez-vous construire : un script Python, un site, un système complet avec assistant IA, ou une mission ?",
    askFeatures: "Quelles fonctions sont indispensables pour cette première version ?",
    askDelay: "Quel délai visez-vous ?",
    askEmail: "Pour transmettre le dossier à Thomas par écrit, quel email faut-il utiliser ?",
    askCompany: (name) =>
      name
        ? `Merci ${name}. Quelle est la structure qui souhaite travailler avec Thomas ?`
        : "Quelle est la structure qui souhaite travailler avec Thomas ?",
    askRole: "Quel type de collaboration envisagez-vous : mission au TJM de 350 €/jour, ou un poste tech ?",
    recruitOpen:
      "Vous souhaitez proposer une mission ou un poste à Thomas. Dites-moi votre prénom, le nom de la structure, le type de collaboration (TJM 350 €/jour ou poste) et le meilleur email pour répondre par écrit.",
    price: PRICE_FR,
    summaryHello: (name) => `Récapitulatif pour ${name || "vous"}.`,
    labels: { need: "Besoin", features: "Fonctions", delay: "Délai", email: "Email", company: "Structure", role: "Collaboration" },
    rec: {
      starter: "Formule recommandée : Pack Starter à 149 €. Le besoin tient dans un script, une automatisation ou une landing.",
      pro: "Formule recommandée : Pack Pro à 397 € (ou 2x 209 €). C'est le plus choisi pour un système web complet avec assistant IA, base de données et paiement sécurisé.",
      enterprise: "Formule recommandée : Pack Enterprise à 797 €. Le périmètre couvre une application, des automatisations avancées et le déploiement.",
      recruit:
        "Thomas est disponible pour des missions au TJM de 350 €/jour et ouvert aux postes tech, en France et à l'international, 100 % à distance. Expertise : Python, IA, architecture web, interfaces immersives.",
    },
    studioLead: "Mode Studio. Voici la marche à suivre, puis le prompt Cursor prêt à coller.",
    studioSteps: [
      "Écrire le périmètre en cinq lignes testables : qui s'en sert, ce qui est livré, ce qui attend.",
      "Poser l'arborescence, les contrats de données et le chemin principal avant les variantes.",
      "Implémenter ce chemin, puis les états vides, les erreurs et le responsive.",
      "Relire la sécurité : aucun secret dans le client, paiement délégué à Stripe, entrées validées.",
      "Vérifier la finition comme un client, lancer le build, et seulement ensuite élargir le périmètre.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "Tu es directeur technique et ingénieur senior. Tu travailles pour Thomas, Powertech The Future (Python, IA, systèmes web).",
        "Livre un résultat de très haute qualité, rapidement, sans demander d'appel téléphonique.",
        `Brief : ${brief}`,
        "Contraintes :",
        "- TypeScript strict, modules courts, noms explicites.",
        "- Aucun secret dans le code client. Le paiement passe par Stripe Elements : ne collecte pas un PAN sur notre serveur.",
        "- UI fluide, clavier accessible, états vides et d'erreur visibles.",
        "- Si de l'IA générative est utilisée dans le produit, le dire clairement à l'utilisateur.",
        "Marche à suivre dans ta réponse :",
        "1. Reformuler le livrable en hypothèses explicites.",
        "2. Donner l'arborescence des fichiers.",
        "3. Implémenter le chemin principal.",
        "4. Ajouter validation, sécurité et finition.",
        "5. Lister les critères d'acceptation et la commande pour vérifier.",
        "Critères d'acceptation :",
        "- Le parcours principal se termine sans blocage.",
        "- Les montants affichés restent 149 €, 397 € (ou 2x 209 €), 797 €, 49 €/mois, TJM 350 €/jour s'ils sont concernés.",
        "- Le build TypeScript passe.",
        "Ne t'arrête pas pour poser des questions si le brief suffit : avance avec des hypothèses nommées.",
      ]),
    quick: [
      { label: "Site + IA", text: "Je veux un système web complet avec un assistant IA." },
      { label: "Script Python", text: "Je veux un script Python ou une automatisation." },
      { label: "Recrutement", text: "Je recrute Thomas pour une mission tech." },
      { label: "Voir les offres", text: "Quels sont les prix ?" },
    ],
  },
  en: {
    askName: "What should I call you?",
    askNeed: (name) =>
      name
        ? `Lovely to meet you, ${name}. In one sentence, what do you want to build: a Python script, a website, a full web + AI system, or a hiring conversation?`
        : "In one sentence, what do you want to build: a Python script, a website, a full web + AI system, or a hiring conversation?",
    askFeatures: "Which features are essential in the first version?",
    askDelay: "What timeline are you aiming for?",
    askEmail: "Which email should Thomas use to reply in writing?",
    askCompany: (name) => (name ? `Thank you, ${name}. Which company is this for?` : "Which company is this for?"),
    askRole: "What kind of collaboration: a contract at €350/day, or a tech role?",
    recruitOpen:
      "You want to propose a mission or a role to Thomas. Tell me your name, the company, the collaboration type (€350/day or a position), and the best email for a written reply.",
    price: `Official Powertech The Future offers:
• Starter — automation, Python script or landing page: €149
• Pro — full web + AI system, most chosen: €397 (or 2x €209)
• Enterprise — custom architecture: €797
• Hosting, maintenance & AI evolution: €49 / month
• Tech mission or hiring: €350 / day`,
    summaryHello: (name) => `Summary for ${name || "you"}.`,
    labels: { need: "Need", features: "Features", delay: "Timeline", email: "Email", company: "Company", role: "Collaboration" },
    rec: {
      starter: "Recommended offer: Starter at €149. The need fits a script, an automation, or a landing page.",
      pro: "Recommended offer: Pro at €397 (or 2x €209). It is the most chosen pack for a full website with a custom AI assistant, database, and secure payment.",
      enterprise: "Recommended offer: Enterprise at €797. The scope is a full application, advanced Python automation, and deployment.",
      recruit:
        "Thomas is available for missions at €350/day and open to tech roles, in France and internationally, fully remote. Craft: Python, AI, web architecture, immersive interfaces.",
    },
    studioLead: "Studio mode. Here is the exact path, then the Cursor prompt ready to paste.",
    studioSteps: [
      "Write the scope as five testable lines: who uses it, what ships, what waits.",
      "Set the file tree, data contracts, and the main path before the edge cases.",
      "Build that path, then empty states, errors, and responsive layout.",
      "Review security: no secrets in the client, payments delegated to Stripe, inputs validated.",
      "Finish as a client would, run the build, and only then widen the scope.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "You are a senior staff engineer working for Thomas at Powertech The Future (Python, AI, web systems).",
        "Ship very high quality work quickly. Do not ask for a phone call.",
        `Brief: ${brief}`,
        "Constraints:",
        "- Strict TypeScript, short modules, explicit names.",
        "- No secrets in client code. Payments go through Stripe Elements. Never post a card number to our server.",
        "- Fluid UI, keyboard access, visible empty and error states.",
        "- If generative AI is part of the product, say so plainly to the user.",
        "In your work:",
        "1. Restate the deliverable with named assumptions.",
        "2. Give the file tree.",
        "3. Implement the main path.",
        "4. Add validation, security, and finish.",
        "5. List acceptance criteria and the command to verify.",
        "Acceptance:",
        "- The main journey completes without a dead end.",
        "- Official prices stay €149, €397 (or 2x €209), €797, €49/month, €350/day when relevant.",
        "- The TypeScript build passes.",
        "If the brief is enough, proceed with named assumptions instead of stopping to ask questions.",
      ]),
    quick: [
      { label: "Web + AI", text: "I need a full website with a custom AI assistant." },
      { label: "Python script", text: "I need a Python script or an automation." },
      { label: "Hiring", text: "We are hiring Thomas for a tech mission." },
      { label: "Pricing", text: "What are the prices?" },
    ],
  },
  es: {
    askName: "¿Cómo debo llamarte?",
    askNeed: (name) =>
      name
        ? `Encantada, ${name}. En una frase: ¿un script Python, una web, un sistema completo con asistente de IA, o una misión?`
        : "En una frase: ¿un script Python, una web, un sistema completo con asistente de IA, o una misión?",
    askFeatures: "¿Qué funciones son imprescindibles en la primera versión?",
    askDelay: "¿Qué plazo tienes en mente?",
    askEmail: "¿Qué email uso para que Thomas responda por escrito?",
    askCompany: (name) => (name ? `Gracias, ${name}. ¿De qué empresa se trata?` : "¿De qué empresa se trata?"),
    askRole: "¿Qué colaboración buscas: misión a 350 €/día o un puesto tech?",
    recruitOpen:
      "Quieres proponer una misión o un puesto a Thomas. Dime tu nombre, la empresa, el tipo de colaboración (350 €/día o puesto) y el email para responder por escrito.",
    price: `Ofertas oficiales:
• Starter — automatización, script Python o landing: 149 €
• Pro — sistema web + IA, el más elegido: 397 € (o 2x 209 €)
• Enterprise — arquitectura a medida: 797 €
• Hosting, mantenimiento y evolución IA: 49 € / mes
• Misión o contratación tech: 350 € / día`,
    summaryHello: (name) => `Resumen para ${name || "ti"}.`,
    labels: { need: "Necesidad", features: "Funciones", delay: "Plazo", email: "Email", company: "Empresa", role: "Colaboración" },
    rec: {
      starter: "Recomendación: Pack Starter a 149 €. Encaja con un script, una automatización o una landing.",
      pro: "Recomendación: Pack Pro a 397 € (o 2x 209 €). Es el más elegido para una web completa con asistente de IA, base de datos y pago seguro.",
      enterprise: "Recomendación: Pack Enterprise a 797 €. El alcance es una aplicación, automatizaciones avanzadas y el despliegue.",
      recruit: "Thomas está disponible para misiones a 350 €/día y abierto a puestos tech, en Francia y a distancia internacional. Python, IA, arquitectura web.",
    },
    studioLead: "Modo Studio. Esta es la ruta exacta y el prompt de Cursor listo para copiar.",
    studioSteps: [
      "Escribir el alcance en cinco líneas comprobables.",
      "Fijar el árbol de archivos y el camino principal.",
      "Implementar ese camino, luego vacíos, errores y responsive.",
      "Revisar seguridad: sin secretos en el cliente, pago con Stripe.",
      "Probar como cliente y pasar el build antes de ampliar.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "Eres ingeniero senior de Thomas en Powertech The Future.",
        "Entrega alta calidad, rápido, sin pedir una llamada.",
        `Brief: ${brief}`,
        "TypeScript estricto. Sin secretos en el cliente. El pago va por Stripe Elements, nunca un PAN a nuestro servidor.",
        "Da el árbol de archivos, implementa el camino principal, valida entradas y lista criterios de aceptación.",
        "Precios oficiales si aplican: 149 €, 397 € o 2x 209 €, 797 €, 49 €/mes, 350 €/día.",
      ]),
    quick: [
      { label: "Web + IA", text: "Quiero un sitio completo con un asistente de IA." },
      { label: "Script Python", text: "Quiero un script Python o una automatización." },
      { label: "Contratación", text: "Quiero contratar a Thomas para una misión tech." },
      { label: "Precios", text: "¿Cuáles son los precios?" },
    ],
  },
  de: {
    askName: "Wie darf ich Sie nennen?",
    askNeed: (name) =>
      name
        ? `Freut mich, ${name}. In einem Satz: ein Python-Skript, eine Website, ein komplettes Web-+-KI-System oder eine Mission?`
        : "In einem Satz: ein Python-Skript, eine Website, ein komplettes Web-+-KI-System oder eine Mission?",
    askFeatures: "Welche Funktionen sind in der ersten Version unverzichtbar?",
    askDelay: "Welchen Zeitrahmen peilen Sie an?",
    askEmail: "Welche E-Mail soll Thomas für die schriftliche Antwort nutzen?",
    askCompany: (name) => (name ? `Danke, ${name}. Um welches Unternehmen geht es?` : "Um welches Unternehmen geht es?"),
    askRole: "Welche Zusammenarbeit: Auftrag zu 350 €/Tag oder eine Tech-Stelle?",
    recruitOpen:
      "Sie möchten Thomas eine Mission oder eine Stelle anbieten. Nennen Sie mir Ihren Namen, das Unternehmen, die Art (350 €/Tag oder Stelle) und die E-Mail für eine schriftliche Antwort.",
    price: `Offizielle Angebote:
• Starter — Automatisierung, Python-Skript oder Landing: 149 €
• Pro — komplettes Web-+-KI-System, am häufigsten gewählt: 397 € (oder 2x 209 €)
• Enterprise — Architektur nach Maß: 797 €
• Hosting, Wartung & KI-Weiterentwicklung: 49 € / Monat
• Tech-Mission oder Recruiting: 350 € / Tag`,
    summaryHello: (name) => `Zusammenfassung für ${name || "Sie"}.`,
    labels: { need: "Bedarf", features: "Funktionen", delay: "Frist", email: "E-Mail", company: "Unternehmen", role: "Zusammenarbeit" },
    rec: {
      starter: "Empfehlung: Starter für 149 €. Passend für Skript, Automatisierung oder Landingpage.",
      pro: "Empfehlung: Pro für 397 € (oder 2x 209 €). Das meistgewählte Paket für eine komplette Website mit KI-Assistent, Datenbank und sicherer Zahlung.",
      enterprise: "Empfehlung: Enterprise für 797 €. Anwendung, fortgeschrittene Python-Automatisierung und Deployment.",
      recruit: "Thomas ist für Missionen zu 350 €/Tag verfügbar und offen für Tech-Stellen, remote, Frankreich und international. Python, KI, Webarchitektur.",
    },
    studioLead: "Studio-Modus. Das ist der genaue Weg, danach der Cursor-Prompt zum Einfügen.",
    studioSteps: [
      "Den Umfang in fünf prüfbaren Zeilen festhalten.",
      "Dateibaum und Hauptpfad festlegen.",
      "Den Hauptpfad bauen, dann Leerzustände, Fehler und Responsive.",
      "Sicherheit prüfen: keine Secrets im Client, Zahlung über Stripe.",
      "Wie ein Kunde prüfen und den Build laufen lassen.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "Du bist Senior Engineer für Thomas bei Powertech The Future.",
        "Liefere hohe Qualität, schnell, ohne Telefonat.",
        `Brief: ${brief}`,
        "Striktes TypeScript. Keine Secrets im Client. Zahlung über Stripe Elements, niemals eine Kartennummer an unseren Server.",
        "Gib den Dateibaum, implementiere den Hauptpfad, validiere Eingaben und nenne Abnahmekriterien.",
        "Offizielle Beträge falls relevant: 149 €, 397 € oder 2x 209 €, 797 €, 49 €/Monat, 350 €/Tag.",
      ]),
    quick: [
      { label: "Web + KI", text: "Ich brauche eine komplette Website mit KI-Assistent." },
      { label: "Python-Skript", text: "Ich brauche ein Python-Skript oder eine Automatisierung." },
      { label: "Recruiting", text: "Wir möchten Thomas für eine Tech-Mission engagieren." },
      { label: "Preise", text: "Was sind die Preise?" },
    ],
  },
  it: {
    askName: "Come posso chiamarti?",
    askNeed: (name) =>
      name
        ? `Piacere, ${name}. In una frase: uno script Python, un sito, un sistema completo con assistente IA, o una missione?`
        : "In una frase: uno script Python, un sito, un sistema completo con assistente IA, o una missione?",
    askFeatures: "Quali funzioni sono indispensabili nella prima versione?",
    askDelay: "Quale scadenza hai in mente?",
    askEmail: "Quale email deve usare Thomas per rispondere per iscritto?",
    askCompany: (name) => (name ? `Grazie, ${name}. Di quale azienda si tratta?` : "Di quale azienda si tratta?"),
    askRole: "Che collaborazione cerchi: missione a 350 €/giorno o un ruolo tech?",
    recruitOpen:
      "Vuoi proporre una missione o un ruolo a Thomas. Dimmi il tuo nome, l'azienda, il tipo di collaborazione (350 €/giorno o ruolo) e l'email per una risposta scritta.",
    price: `Offerte ufficiali:
• Starter — automazione, script Python o landing: 149 €
• Pro — sistema web + IA, il più scelto: 397 € (o 2x 209 €)
• Enterprise — architettura su misura: 797 €
• Hosting, manutenzione ed evoluzione IA: 49 € / mese
• Missione o recruiting tech: 350 € / giorno`,
    summaryHello: (name) => `Riepilogo per ${name || "te"}.`,
    labels: { need: "Bisogno", features: "Funzioni", delay: "Tempi", email: "Email", company: "Azienda", role: "Collaborazione" },
    rec: {
      starter: "Consiglio: Pack Starter a 149 €. Adatto a uno script, un'automazione o una landing.",
      pro: "Consiglio: Pack Pro a 397 € (o 2x 209 €). Il più scelto per un sito completo con assistente IA, database e pagamento sicuro.",
      enterprise: "Consiglio: Pack Enterprise a 797 €. Applicazione, automazioni Python avanzate e deploy.",
      recruit: "Thomas è disponibile per missioni a 350 €/giorno e aperto a ruoli tech, da remoto, Francia e internazionale. Python, IA, architettura web.",
    },
    studioLead: "Modalità Studio. Ecco il percorso esatto e il prompt Cursor da incollare.",
    studioSteps: [
      "Scrivere il perimetro in cinque righe verificabili.",
      "Fissare l'albero dei file e il percorso principale.",
      "Implementare quel percorso, poi vuoti, errori e responsive.",
      "Controllare la sicurezza: niente segreti nel client, pagamento via Stripe.",
      "Verificare come un cliente e far passare la build.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "Sei un ingegnere senior per Thomas di Powertech The Future.",
        "Consegna alta qualità, in fretta, senza chiedere una chiamata.",
        `Brief: ${brief}`,
        "TypeScript strict. Nessun segreto nel client. Il pagamento passa da Stripe Elements, mai un PAN verso il nostro server.",
        "Dai l'albero dei file, implementa il percorso principale, valida gli input ed elenca i criteri di accettazione.",
      ]),
    quick: [
      { label: "Sito + IA", text: "Voglio un sito completo con un assistente IA." },
      { label: "Script Python", text: "Voglio uno script Python o un'automazione." },
      { label: "Recruiting", text: "Vogliamo ingaggiare Thomas per una missione tech." },
      { label: "Prezzi", text: "Quali sono i prezzi?" },
    ],
  },
  pt: {
    askName: "Como devo chamar-te?",
    askNeed: (name) =>
      name
        ? `Prazer, ${name}. Numa frase: um script Python, um site, um sistema completo com assistente de IA, ou uma missão?`
        : "Numa frase: um script Python, um site, um sistema completo com assistente de IA, ou uma missão?",
    askFeatures: "Que funções são indispensáveis na primeira versão?",
    askDelay: "Que prazo tens em mente?",
    askEmail: "Que email deve o Thomas usar para responder por escrito?",
    askCompany: (name) => (name ? `Obrigada, ${name}. Qual é a empresa?` : "Qual é a empresa?"),
    askRole: "Que colaboração procuras: missão a 350 €/dia ou um cargo tech?",
    recruitOpen:
      "Queres propor uma missão ou um cargo ao Thomas. Diz-me o teu nome, a empresa, o tipo (350 €/dia ou cargo) e o email para uma resposta escrita.",
    price: `Ofertas oficiais:
• Starter — automação, script Python ou landing: 149 €
• Pro — sistema web + IA, o mais escolhido: 397 € (ou 2x 209 €)
• Enterprise — arquitetura à medida: 797 €
• Alojamento, manutenção e evolução IA: 49 € / mês
• Missão ou recrutamento tech: 350 € / dia`,
    summaryHello: (name) => `Resumo para ${name || "ti"}.`,
    labels: { need: "Necessidade", features: "Funções", delay: "Prazo", email: "Email", company: "Empresa", role: "Colaboração" },
    rec: {
      starter: "Recomendação: Pack Starter a 149 €. Serve para um script, uma automação ou uma landing.",
      pro: "Recomendação: Pack Pro a 397 € (ou 2x 209 €). O mais escolhido para um site completo com assistente de IA, base de dados e pagamento seguro.",
      enterprise: "Recomendação: Pack Enterprise a 797 €. Aplicação, automações Python avançadas e deploy.",
      recruit: "O Thomas está disponível para missões a 350 €/dia e aberto a cargos tech, remoto, França e internacional. Python, IA, arquitetura web.",
    },
    studioLead: "Modo Studio. Este é o caminho exato e o prompt Cursor pronto a colar.",
    studioSteps: [
      "Escrever o âmbito em cinco linhas testáveis.",
      "Fixar a árvore de ficheiros e o caminho principal.",
      "Implementar esse caminho, depois vazios, erros e responsive.",
      "Rever segurança: sem segredos no cliente, pagamento via Stripe.",
      "Verificar como um cliente e passar a build.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "És engenheiro sénior do Thomas na Powertech The Future.",
        "Entrega alta qualidade, depressa, sem pedir uma chamada.",
        `Brief: ${brief}`,
        "TypeScript estrito. Sem segredos no cliente. O pagamento passa pelo Stripe Elements, nunca um PAN para o nosso servidor.",
        "Dá a árvore de ficheiros, implementa o caminho principal, valida entradas e lista critérios de aceitação.",
      ]),
    quick: [
      { label: "Site + IA", text: "Quero um site completo com um assistente de IA." },
      { label: "Script Python", text: "Quero um script Python ou uma automação." },
      { label: "Recrutamento", text: "Queremos contratar o Thomas para uma missão tech." },
      { label: "Preços", text: "Quais são os preços?" },
    ],
  },
  ja: {
    askName: "お名前を教えてください。",
    askNeed: (name) =>
      name
        ? `${name}さん、はじめまして。一文で教えてください。Pythonのスクリプト、サイト、AIアシスタント付きの本格的なウェブ、それとも技術ミッションですか？`
        : "一文で教えてください。Pythonのスクリプト、サイト、AIアシスタント付きの本格的なウェブ、それとも技術ミッションですか？",
    askFeatures: "最初の版で欠かせない機能は何ですか？",
    askDelay: "希望の納期を教えてください。",
    askEmail: "Thomasが文章で返信するためのメールアドレスを教えてください。",
    askCompany: (name) => (name ? `${name}さん、ありがとうございます。会社名を教えてください。` : "会社名を教えてください。"),
    askRole: "ご希望は日額350ユーロのミッションですか、それとも技術職の採用ですか？",
    recruitOpen:
      "Thomasへのミッションまたは採用のご提案ですね。お名前、会社名、形態（日額350ユーロまたはポジション）、返信先メールを教えてください。",
    price: `公式プラン：
• Starter — 自動化、Pythonスクリプト、ランディング：149ユーロ
• Pro — Web + AIの本格システム（最も選ばれています）：397ユーロ（または209ユーロ×2）
• Enterprise — 個別アーキテクチャ：797ユーロ
• ホスティング、保守、AIの進化：月額49ユーロ
• 技術ミッション / 採用：日額350ユーロ`,
    summaryHello: (name) => `${name || "お客"}さま向けのまとめです。`,
    labels: { need: "ご要望", features: "機能", delay: "納期", email: "メール", company: "会社", role: "関わり方" },
    rec: {
      starter: "おすすめはStarterの149ユーロです。スクリプト、自動化、ランディングに向いています。",
      pro: "おすすめはProの397ユーロ（または209ユーロ×2）です。AIアシスタント、データベース、安全な決済を含む本格サイトで最も選ばれています。",
      enterprise: "おすすめはEnterpriseの797ユーロです。アプリケーション、高度なPython自動化、デプロイまで含みます。",
      recruit: "Thomasは日額350ユーロのミッションと技術職に対応できます。フランスと海外、完全リモート。Python、AI、ウェブアーキテクチャ。",
    },
    studioLead: "スタジオモードです。手順のあと、そのまま貼れるCursorプロンプトを置きます。",
    studioSteps: [
      "届ける範囲を、検証できる五行で書く。",
      "ファイル構成と本線の導線を先に決める。",
      "本線を実装し、その後に空状態、エラー、レスポンシブを足す。",
      "秘密情報をクライアントに置かず、決済はStripeに任せる。",
      "お客の目で確認し、ビルドが通ってから範囲を広げる。",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "あなたはPowertech The FutureのThomasのためのシニアエンジニアです。",
        "電話を求めず、高品質を速く届けてください。",
        `ブリーフ：${brief}`,
        "TypeScriptはstrict。クライアントに秘密を置かない。決済はStripe Elements。カード番号をこちらのサーバーへ送らない。",
        "ファイル構成、本線の実装、入力検証、受け入れ条件を示してください。",
        "関係する場合の公式金額：149ユーロ、397ユーロまたは209ユーロ×2、797ユーロ、月額49ユーロ、日額350ユーロ。",
      ]),
    quick: [
      { label: "Web + AI", text: "AIアシスタント付きの本格的なウェブサイトが欲しいです。" },
      { label: "Python", text: "Pythonのスクリプトか自動化が欲しいです。" },
      { label: "採用", text: "技術ミッションでThomasを採用したいです。" },
      { label: "料金", text: "料金を教えてください。" },
    ],
  },
  ko: {
    askName: "어떻게 부르면 될까요?",
    askNeed: (name) =>
      name
        ? `${name}님, 반가워요. 한 문장으로 알려 주세요. Python 스크립트, 웹사이트, AI 어시스턴트가 있는 전체 시스템, 아니면 기술 미션인가요?`
        : "한 문장으로 알려 주세요. Python 스크립트, 웹사이트, AI 어시스턴트가 있는 전체 시스템, 아니면 기술 미션인가요?",
    askFeatures: "첫 버전에 꼭 필요한 기능은 무엇인가요?",
    askDelay: "원하는 일정을 알려 주세요.",
    askEmail: "Thomas가 글로 답장할 이메일을 알려 주세요.",
    askCompany: (name) => (name ? `감사합니다, ${name}님. 회사 이름을 알려 주세요.` : "회사 이름을 알려 주세요."),
    askRole: "원하시는 협업은 일 350유로의 미션인가요, 기술 포지션인가요?",
    recruitOpen:
      "Thomas에게 미션이나 포지션을 제안하시려는군요. 이름, 회사, 형태(일 350유로 또는 포지션), 답장받을 이메일을 알려 주세요.",
    price: `공식 제안:
• Starter — 자동화, Python 스크립트 또는 랜딩: 149유로
• Pro — 웹 + AI 전체 시스템, 가장 많이 선택: 397유로 (또는 209유로 x2)
• Enterprise — 맞춤 아키텍처: 797유로
• 호스팅, 유지보수, AI 진화: 월 49유로
• 기술 미션 또는 채용: 일 350유로`,
    summaryHello: (name) => `${name || "고객"}님을 위한 정리입니다.`,
    labels: { need: "요청", features: "기능", delay: "일정", email: "이메일", company: "회사", role: "협업" },
    rec: {
      starter: "추천은 Starter 149유로입니다. 스크립트, 자동화, 랜딩에 맞습니다.",
      pro: "추천은 Pro 397유로(또는 209유로 x2)입니다. AI 어시스턴트, 데이터베이스, 안전한 결제가 있는 전체 사이트에 가장 많이 선택됩니다.",
      enterprise: "추천은 Enterprise 797유로입니다. 애플리케이션, 고급 Python 자동화, 배포까지입니다.",
      recruit: "Thomas는 일 350유로의 미션과 기술 포지션이 가능합니다. 프랑스와 해외, 완전 원격. Python, AI, 웹 아키텍처.",
    },
    studioLead: "스튜디오 모드입니다. 정확한 순서 다음에 붙여 넣을 Cursor 프롬프트를 둡니다.",
    studioSteps: [
      "전달 범위를 검증 가능한 다섯 줄로 적는다.",
      "파일 구조와 주요 경로를 먼저 고정한다.",
      "주요 경로를 구현한 뒤 빈 상태, 오류, 반응형을 더한다.",
      "클라이언트에 비밀을 두지 않고 결제는 Stripe에 맡긴다.",
      "고객의 눈으로 확인하고 빌드가 통과한 뒤에 범위를 넓힌다.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "당신은 Powertech The Future의 Thomas를 위한 시니어 엔지니어입니다.",
        "전화 없이 높은 품질을 빠르게 전달하세요.",
        `브리프: ${brief}`,
        "TypeScript strict. 클라이언트에 비밀 금지. 결제는 Stripe Elements. 카드 번호는 우리 서버로 보내지 않습니다.",
        "파일 구조, 주요 경로 구현, 입력 검증, 인수 조건을 제시하세요.",
      ]),
    quick: [
      { label: "웹 + AI", text: "AI 어시스턴트가 있는 완전한 웹사이트가 필요합니다." },
      { label: "Python", text: "Python 스크립트나 자동화가 필요합니다." },
      { label: "채용", text: "기술 미션으로 Thomas를 채용하고 싶습니다." },
      { label: "가격", text: "가격이 어떻게 되나요?" },
    ],
  },
  zh: {
    askName: "我该怎么称呼你？",
    askNeed: (name) =>
      name
        ? `${name}，很高兴认识你。用一句话告诉我：你想做 Python 脚本、网站、带 AI 助手的完整系统，还是一次技术合作？`
        : "用一句话告诉我：你想做 Python 脚本、网站、带 AI 助手的完整系统，还是一次技术合作？",
    askFeatures: "第一版里哪些功能是必须的？",
    askDelay: "你希望的周期是多久？",
    askEmail: "Thomas 用哪个邮箱书面回复？",
    askCompany: (name) => (name ? `谢谢，${name}。是哪家公司？` : "是哪家公司？"),
    askRole: "合作形式是每天 350 欧元的任务，还是一个技术岗位？",
    recruitOpen: "你想向 Thomas 提议一次任务或一个岗位。请告诉我你的名字、公司、形式（每天 350 欧元或岗位）以及书面回复的邮箱。",
    price: `官方方案：
• Starter — 自动化、Python 脚本或落地页：149 欧元
• Pro — 完整网页 + AI 系统，选择最多：397 欧元（或 209 欧元 × 2）
• Enterprise — 定制架构：797 欧元
• 托管、维护与 AI 演进：每月 49 欧元
• 技术任务或招聘：每天 350 欧元`,
    summaryHello: (name) => `给${name || "你"}的纪要。`,
    labels: { need: "需求", features: "功能", delay: "周期", email: "邮箱", company: "公司", role: "合作" },
    rec: {
      starter: "建议 Starter，149 欧元。适合脚本、自动化或落地页。",
      pro: "建议 Pro，397 欧元（或 209 欧元 × 2）。这是带定制 AI 助手、数据库和安全支付的完整网站里被选得最多的方案。",
      enterprise: "建议 Enterprise，797 欧元。范围是完整应用、进阶 Python 自动化和部署。",
      recruit: "Thomas 可接受每天 350 欧元的任务，也对技术岗位开放，法国与国际远程。专长是 Python、AI 和网页架构。",
    },
    studioLead: "工作室模式。下面是确切步骤，以及可直接粘贴的 Cursor 提示。",
    studioSteps: [
      "用五行可验证的话写清交付范围。",
      "先定文件结构和主路径。",
      "实现主路径，再补空状态、错误和响应式。",
      "检查安全：密钥不进客户端，支付交给 Stripe。",
      "按客户的眼睛验收，构建通过后再扩大范围。",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "你是 Powertech The Future 的 Thomas 的高级工程师。",
        "高质量、快速交付，不要要求电话。",
        `简报：${brief}`,
        "TypeScript 严格模式。客户端不放密钥。支付走 Stripe Elements，卡号不要发到我们的服务器。",
        "给出文件结构，实现主路径，校验输入，并列出验收标准。",
      ]),
    quick: [
      { label: "网站 + AI", text: "我需要一个带 AI 助手的完整网站。" },
      { label: "Python 脚本", text: "我需要一个 Python 脚本或自动化。" },
      { label: "招聘", text: "我们想以技术任务的方式聘用 Thomas。" },
      { label: "价格", text: "价格是多少？" },
    ],
  },
  ar: {
    askName: "كيف أناديك؟",
    askNeed: (name) =>
      name
        ? `سعيدة بلقائك يا ${name}. في جملة واحدة: سكربت بايثون، موقع، نظام ويب كامل مع مساعد ذكاء اصطناعي، أم مهمة تقنية؟`
        : "في جملة واحدة: سكربت بايثون، موقع، نظام ويب كامل مع مساعد ذكاء اصطناعي، أم مهمة تقنية؟",
    askFeatures: "ما الوظائف الضرورية في النسخة الأولى؟",
    askDelay: "ما المهلة التي تهدف إليها؟",
    askEmail: "أي بريد يستخدمه توماس للرد كتابةً؟",
    askCompany: (name) => (name ? `شكرًا يا ${name}. ما اسم الجهة؟` : "ما اسم الجهة؟"),
    askRole: "أي تعاون تريد: مهمة بسعر 350 € في اليوم، أم وظيفة تقنية؟",
    recruitOpen:
      "تريد اقتراح مهمة أو وظيفة على توماس. أخبرني باسمك، والجهة، ونوع التعاون (350 € في اليوم أو وظيفة)، والبريد للرد كتابةً.",
    price: `العروض الرسمية:
• Starter — أتمتة أو سكربت بايثون أو صفحة هبوط: 149 €
• Pro — نظام ويب + ذكاء اصطناعي، الأكثر اختيارًا: 397 € (أو 2×209 €)
• Enterprise — هندسة حسب الطلب: 797 €
• استضافة وصيانة وتطوّر الذكاء الاصطناعي: 49 € / شهر
• مهمة أو توظيف تقني: 350 € / يوم`,
    summaryHello: (name) => `ملخص لـ ${name || "أنت"}.`,
    labels: { need: "الحاجة", features: "الوظائف", delay: "المهلة", email: "البريد", company: "الجهة", role: "التعاون" },
    rec: {
      starter: "التوصية: باقة Starter بـ 149 €. تناسب سكربتًا أو أتمتة أو صفحة هبوط.",
      pro: "التوصية: باقة Pro بـ 397 € (أو 2×209 €). الأكثر اختيارًا لموقع كامل مع مساعد ذكاء اصطناعي وقاعدة بيانات ودفع آمن.",
      enterprise: "التوصية: باقة Enterprise بـ 797 €. تطبيق كامل، أتمتة بايثون متقدمة، ونشر.",
      recruit: "توماس متاح لمهام بسعر 350 € في اليوم ومنفتح على وظائف تقنية، عن بُعد، في فرنسا ودوليًا. Python وIA وهندسة الويب.",
    },
    studioLead: "وضع الاستوديو. هذه الخطوات الدقيقة، ثم أمر Cursor الجاهز للنسخ.",
    studioSteps: [
      "اكتب النطاق في خمسة أسطر قابلة للاختبار.",
      "ثبّت شجرة الملفات والمسار الرئيسي.",
      "نفّذ ذلك المسار، ثم حالات الفراغ والأخطاء والتجاوب.",
      "راجع الأمان: لا أسرار في العميل، والدفع عبر Stripe.",
      "اختبر كما يفعل العميل، ثم وسّع النطاق بعد نجاح البناء.",
    ],
    studioPrompt: (brief) =>
      promptBlock([
        "أنت مهندس أول يعمل مع توماس في Powertech The Future.",
        "سلّم جودة عالية بسرعة، ومن دون طلب مكالمة.",
        `الموجز: ${brief}`,
        "TypeScript صارم. لا أسرار في العميل. الدفع عبر Stripe Elements، ولا يُرسل رقم البطاقة إلى خادمنا.",
        "أعط شجرة الملفات، ونفّذ المسار الرئيسي، وتحقق من المدخلات، واذكر معايير القبول.",
      ]),
    quick: [
      { label: "ويب + ذكاء", text: "أريد موقعًا كاملًا مع مساعد ذكاء اصطناعي." },
      { label: "سكربت بايثون", text: "أريد سكربت بايثون أو أتمتة." },
      { label: "توظيف", text: "نريد توظيف توماس لمهمة تقنية." },
      { label: "الأسعار", text: "ما الأسعار؟" },
    ],
  },
};

export const LANGS = Object.keys(COPY) as Lang[];
