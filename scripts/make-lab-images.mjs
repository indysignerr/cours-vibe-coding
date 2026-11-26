// Les images fixes de la maquette 3D : une par pilier (ce que voit
// quelqu'un sans JavaScript, en mouvement réduit, ou pendant que la scène
// charge).
//
// Ce sont des captures de la VRAIE scène, pas des dessins à part. À refaire
// si la scène change d'aspect (src/components/lab/).
//
// 1. Lancer le site en développement : npm run dev
// 2. Ouvrir http://localhost:3000/ sur un grand écran, faire défiler
//    jusqu'aux piliers et attendre que la maquette s'affiche.
// 3. Dans la console du navigateur, coller ceci. Il fige la scène, cadre
//    chaque pièce et télécharge quatre fichiers PNG à fond transparent :
//
//      const lab = window.__lab, stage = document.querySelector(".stage");
//      const frames = (n) => new Promise((r) => { let i = 0; const f = () => (++i >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
//      const shoot = async (name, w, h, p) => {
//        stage.style.cssText = `position:fixed;top:0;left:0;width:${w}px;height:${h}px;z-index:9999;margin:0;border:0`;
//        await new Promise((r) => setTimeout(r, 400)); await frames(3);
//        lab.progress.current = p;
//        [6.4, 4.9, 7.0, 2.4].forEach((t, i) => { lab.times[i].current = t; });
//        await frames(4);
//        const a = document.createElement("a");
//        a.href = URL.createObjectURL(await lab.snap()); a.download = name; a.click();
//      };
//      lab.hold = true;
//      await shoot("room-learn.png", 800, 600, 0);
//      await shoot("room-build.png", 800, 600, 1);
//      await shoot("room-compete.png", 800, 600, 2);
//      await shoot("room-connect.png", 800, 600, 3);
//      stage.style.cssText = ""; lab.hold = false;
//
// 4. Ranger les quatre PNG dans un dossier, puis :
//      node scripts/make-lab-images.mjs chemin/du/dossier
//
// `window.__lab` n'existe qu'en développement : rien de tout cela n'est
// dans le site en ligne.
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const from = process.argv[2];
if (!from) {
  console.error("Usage : node scripts/make-lab-images.mjs <dossier des captures PNG>");
  process.exit(1);
}
const out = "public/images/lab";
await mkdir(out, { recursive: true });

// Le fond reste transparent : l'image se pose sur le marine de la page, grain compris.
const webp = (file, width, height, name) =>
  sharp(join(from, file))
    .resize(width, height, { fit: "cover" })
    .webp({ quality: 84, alphaQuality: 90, effort: 6 })
    .toFile(join(out, name));

for (const key of ["learn", "build", "compete", "connect"]) {
  await webp(`room-${key}.png`, 1200, 900, `room-${key}.webp`);
}
console.log("images de la maquette écrites dans", out);
