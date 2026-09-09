async function main() {
  const urls = [
    "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Backgrounds/Aurora/Aurora.jsx",
    "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Backgrounds/Aurora/Aurora.tsx",
    "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/components/Backgrounds/Aurora/Aurora.jsx",
    "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/components/Backgrounds/Aurora/Aurora.tsx",
    "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/components/Aurora/Aurora.jsx",
    "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/components/Aurora/Aurora.tsx",
    "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/Aurora.jsx",
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(u, "->", res.status);
      if (res.ok) {
        const text = await res.text();
        console.log("Found length:", text.length);
        console.log(text.substring(0, 800));
      }
    } catch(e) {}
  }
}
main();
