# Guía: conectar tu cuenta de GitHub a opencode y contribuir a este repositorio

Esta guía explica, paso a paso, cómo conectar tu propia cuenta de GitHub a tu instalación de
`opencode`, clonar este repositorio privado y enviar contribuciones (ramas, commits y Pull Requests).

Está escrita para los miembros del equipo que trabajan en Windows con PowerShell.

Datos del repositorio:

- Remoto: `https://github.com/gabrielmib/demoblaze-playwright.git`
- Propietario: `gabrielmib`
- Visibilidad: **privado** (necesitas que el propietario te dé acceso)
- Rama por defecto: `master`
- Proyecto: Node.js + TypeScript + Playwright (`package.json` -> `name: demoblaze-playwright`)

> Importante: `opencode` es una herramienta de agente de IA para la terminal. La autenticación de
> `opencode` (sus proveedores de modelo) es **independiente** de tus credenciales de GitHub.
> Para subir código necesitas las credenciales de Git/GitHub (se explican en la sección 3).

---

## 1. Requisitos previos

Instala y verifica lo siguiente antes de empezar:

1. **Node.js LTS** (recomendado Node.js 20 o superior). Verifica:
   ```powershell
   node --version
   npm --version
   ```
   Si no lo tienes, descárgalo desde https://nodejs.org (versión LTS).

2. **Git para Windows**. Verifica:
   ```powershell
   git --version
   ```
   Descárgalo desde https://git-scm.com/download/win si falta.

3. **Una cuenta de GitHub** con acceso concedido por el propietario `gabrielmib` a este repositorio
   privado (ver sección 4).

4. **GitHub CLI (`gh`)**, opcional pero recomendado (lo usaremos para autenticación y para crear PRs).
   Verifica:
   ```powershell
   gh --version
   ```
   Instalación en Windows con winget:
   ```powershell
   winget install --id GitHub.cli
   ```
   Alternativa con Scoop:
   ```powershell
   scoop install gh
   ```

5. **opencode** instalado (ver sección 2).

6. **Dependencias de Playwright** (navegadores). Se instalan después de clonar (ver sección 5).

---

## 2. Instalar opencode

La documentación oficial recomienda, en Windows, usar **WSL** (Windows Subsystem for Linux) para
una mejor experiencia. Si prefieres quedarte en PowerShell nativo, también hay métodos soportados.

Opciones de instalación en **Windows** (fuente: https://opencode.ai/docs/):

- **Chocolatey:**
  ```powershell
  choco install opencode
  ```
- **Scoop:**
  ```powershell
  scoop install opencode
  ```
- **npm (multiplataforma):**
  ```powershell
  npm install -g opencode-ai
  ```
- **Mise:**
  ```powershell
  mise use -g github:anomalyco/opencode
  ```
- **Docker:**
  ```powershell
  docker run -it --rm ghcr.io/anomalyco/opencode
  ```

En macOS/Linux (con bash) el método recomendado es el script de instalación:
```bash
curl -fsSL https://opencode.ai/install | bash
```

Verifica la instalación:
```powershell
opencode --version
```

Notas de la documentación oficial:
- La instalación con **Bun en Windows** estaba "en progreso" al momento de escribir esta guía.
- Recomendación oficial: usar WSL en Windows para compatibilidad y rendimiento completos.
- En Windows, opencode puede requerir la ruta a Git Bash; existe la variable de entorno
  `OPENCODE_GIT_BASH_PATH` para indicarla (ver https://opencode.ai/docs/cli/).

---

## 3. Autenticarse / conectar tu cuenta de GitHub

Hay que distinguir **dos cosas distintas**:

- **A) Autenticación de Git/GitHub** (para clonar, hacer push y abrir PRs). Es lo que necesitas
  para contribuir al repositorio.
- **B) Autenticación de `opencode`** (proveedores de modelo de IA) y su **integración de GitHub
  Agent** (ejecutar opencode dentro de GitHub Actions). No sustituye a la anterior.

### A) Autenticación de Git/GitHub (lo que importa para contribuir)

La forma recomendada es la **GitHub CLI**:

```powershell
gh auth login
```

Responde las preguntas (elige `GitHub.com`, `HTTPS`, y autenticarte vía navegador o token).
Al final, también puedes configurar Git para usar `gh` como helper de credenciales:

```powershell
gh auth setup-git
```

Comprueba el estado y los scopes de tu token:

```powershell
gh auth status
```

Alternativa con token de acceso personal (PAT): crea un token en GitHub
(Settings -> Developer settings -> Personal access tokens) y úsalo como contraseña al hacer push,
o configúralo con el credential manager de Git. Para acceder a un repositorio privado y a
organizaciones, el token normalmente necesita los scopes:

- `repo` (acceso completo a repositorios privados)
- `read:org` (leer la pertenencia a organizaciones, si aplica)

### B) Autenticación de opencode

opencode usa proveedores de modelo (por ejemplo OpenCode Zen, Anthropic, OpenAI, etc.).
Para iniciar sesión en un proveedor:

```powershell
opencode auth login
```

Esto guarda las credenciales en `~/.local/share/opencode/auth.json`. Otros comandos útiles:

```powershell
opencode auth list
opencode auth logout
```

En la TUI también existe el comando `/connect` para conectar un proveedor
(la documentación enlaza a https://opencode.ai/auth para OpenCode Zen).

### Integración de opencode con GitHub (GitHub Agent)

opencode tiene una integración oficial de **GitHub Agent** que ejecuta opencode dentro de
**GitHub Actions** cuando alguien menciona `/opencode` o `/oc` en un issue o Pull Request.
Se instala así, dentro del repositorio:

```powershell
opencode github install
```

Este comando configura el workflow de GitHub Actions y guía la configuración.
También existe el modo manual:

1. Instalar la GitHub App en https://github.com/apps/opencode-agent sobre el repositorio destino.
2. Añadir el workflow en `.github/workflows/opencode.yml`.

En este contexto, la configuración admite la opción `use_github_token: true`, que hace que el
workflow use un `GITHUB_TOKEN` que tú proporcionas (por ejemplo `secrets.GITHUB_TOKEN` o un PAT
guardado como secreto) en lugar de intercambiar un token OIDC. El comando de ejecución usado en
Actions es:

```powershell
opencode github run --event <evento> --token <token>
```

Ten en cuenta: la integración de GitHub Agent **no es necesaria** para que puedas clonar el repo
o abrir Pull Requests manualmente. Es una función adicional para automatizar tareas dentro de GitHub.

> Nota: no confundas `opencode auth login` (login de proveedores de modelo) con la autenticación
> de GitHub. Para contribuir con código, lo esencial es la parte **A** (`gh auth login`).

---

## 4. Clonar el repositorio privado

Como el repositorio es **privado** y su propietario es `gabrielmib`, primero el propietario debe
concederte acceso (agregarte como colaborador o a través de tu equipo/organización). Sin ese acceso,
el clonado o el push fallarán con "permission denied" o "Repository not found".

Una vez tengas acceso, clona con HTTPS:

```powershell
git clone https://github.com/gabrielmib/demoblaze-playwright.git
```

O con SSH (si tienes tu llave SSH configurada en GitHub):

```powershell
git clone git@github.com:gabrielmib/demoblaze-playwright.git
```

Entra al directorio y verifica la rama por defecto:

```powershell
Set-Location demoblaze-playwright
git branch --show-current
```

La rama por defecto del proyecto es `master`.

---

## 5. Instalar dependencias del proyecto

Dentro del repositorio clonado:

```powershell
npm install
```

Instala los navegadores de Playwright (necesarios para ejecutar las pruebas):

```powershell
npx playwright install
```

Si en el futuro faltan dependencias del sistema, la documentación de Playwright ofrece
`npx playwright install --with-deps` (principalmente para Linux).

Dependencias de desarrollo relevantes del proyecto:

- `@playwright/test` ^1.64.0
- `@types/node` ^22.13.0
- `typescript` ^5.6.0

---

## 6. Configurar opencode en el repositorio

opencode funciona sin configuración, pero puedes personalizarlo. La configuración de proyecto se
coloca en la raíz del repo, en un archivo `opencode.json` (o `opencode.jsonc`).
Ambos formatos JSON y JSONC son válidos.

Ejemplo mínimo de `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
```

Puntos importantes (fuente: https://opencode.ai/docs/config/):

- La configuración de proyecto (`opencode.json` en la raíz) tiene mayor precedencia que la global.
- La configuración global vive en `~/.config/opencode/opencode.json`.
- Los archivos se **fusionan**, no se reemplazan.
- El esquema está en https://opencode.ai/config.json (tu editor puede validar y autocompletar).

### AGENTS.md

Dentro de la TUI puedes ejecutar:

```
/init
```

Esto hace que opencode analice el proyecto y cree un archivo `AGENTS.md` en la raíz, que documenta
la estructura y los patrones del proyecto. La documentación recomienda **versionar** `AGENTS.md`
en Git para que opencode entienda mejor el repositorio. También puedes referenciar archivos de
instrucciones con la opción `instructions` del config.

---

## 7. Flujo de trabajo para contribuir

1. Asegúrate de estar en `master` y actualizado:
   ```powershell
   git checkout master
   git pull origin master
   ```

2. Crea una rama para tu trabajo (usa un nombre descriptivo):
   ```powershell
   git checkout -b feature/nombre-descriptivo
   ```

3. Haz tus cambios y revisa el estado:
   ```powershell
   git status
   git diff
   ```

4. Añade y confirma los cambios:
   ```powershell
   git add .
   git commit -m "Descripcion breve del cambio"
   ```

5. Sube la rama al remoto:
   ```powershell
   git push -u origin feature/nombre-descriptivo
   ```

6. Abre un Pull Request. Con la GitHub CLI:
   ```powershell
   gh pr create --base master --head feature/nombre-descriptivo --title "Titulo del PR" --body "Descripcion del cambio"
   ```
   También puedes abrir el PR desde la interfaz web de GitHub, que aparecerá tras el push.

Consejo: trabaja siempre en ramas y evita hacer push directo a `master`; usa Pull Requests para
revisión.

---

## 8. Ejecutar las pruebas y buenas prácticas

Scripts disponibles en `package.json`:

- `npm test` — ejecuta la suite de pruebas.
- `npm run test:auth` — pruebas de autenticación.
- `npm run test:ui` — pruebas de interfaz.
- `npm run test:headed` — ejecuta con el navegador visible.
- `npm run report` — muestra el reporte HTML de Playwright.

Ejemplos:

```powershell
npm test
```

```powershell
npm run test:headed
```

```powershell
npm run report
```

Buenas prácticas:

- **No** hagas commit de `node_modules/` ni de `.env` (ya están en `.gitignore`).
- No subas credenciales, tokens ni secretos. Usa variables de entorno locales.
- No subas artefactos de pruebas: `test-results/`, `playwright-report/`, `blob-report/`,
  `playwright/.cache/` y `*.log` ya están ignorados por `.gitignore`.
- Antes de abrir un PR, ejecuta las pruebas relevantes y verifica que pasan.

---

## 9. Solución de problemas común

- **`Repository not found` o `permission denied` al clonar**: el repositorio es privado.
  Pide al propietario `gabrielmib` que te conceda acceso. Verifica tu autenticación con
  `gh auth status`.
- **`Permission denied` al hacer push**: revisa que estés autenticado (`gh auth status`) y que
  tu token tenga el scope `repo`. Si perteneces a una organización, puede requerir `read:org`.
- **Errores de autenticación de Git**: reautentícate con:
  ```powershell
  gh auth login
  gh auth setup-git
  ```
- **El push usa el usuario equivocado**: revisa la configuración de Git:
  ```powershell
  git config user.name
  git config user.email
  ```
- **Errores al ejecutar pruebas por navegadores faltantes**: vuelve a ejecutar:
  ```powershell
  npx playwright install
  ```
- **opencode no encuentra Git Bash en Windows**: considera instalar/usar WSL o definir
  `OPENCODE_GIT_BASH_PATH` apuntando al ejecutable de Git Bash (ver docs de CLI).
- **Dudas sobre scopes exactos necesarios**: verifica en la documentación oficial de GitHub; los
  scopes más comunes para este flujo son `repo` y `read:org`.

---

## 10. (Opcional) Uso del agente de opencode

Para abrir la interfaz interactiva (TUI) dentro del repositorio:

```powershell
opencode
```

Para ejecutar de forma **no interactiva** con un prompt directo:

```powershell
opencode run "Explica la estructura de este proyecto"
```

Otros comandos útiles:

- `opencode pr <numero>` — obtiene y hace checkout de la rama de un PR y luego ejecuta opencode.
- `opencode models` — lista los modelos disponibles de los proveedores configurados.

---

## 11. Referencias oficiales

Páginas de la documentación de opencode consultadas para esta guía:

- Intro / instalación: https://opencode.ai/docs/
- CLI (comandos, `auth`, `github`, `run`, variables de entorno): https://opencode.ai/docs/cli/
- Integración con GitHub (GitHub Agent / Actions): https://opencode.ai/docs/github/
- Configuración (`opencode.json`, `AGENTS.md`, `instructions`): https://opencode.ai/docs/config/

Detalles no confirmados en la documentación (verifica en la documentación oficial):

- La lista EXACTA de scopes requeridos para `GITHUB_TOKEN` en flujos manuales de push/PR: la
  documentación oficial de opencode no fija scopes concretos para este propósito; se toman de la
  práctica estándar de GitHub (`repo`, `read:org`).
- El nombre exacto del archivo de credenciales en todos los sistemas: la doc indica
  `~/.local/share/opencode/auth.json`; confirma en tu instalación.
- El estado actual del soporte de Bun en Windows (la doc lo marcaba "en progreso"), y cualquier
  cambio de nombres de paquetes o comandos: verifica en https://opencode.ai/docs/ y
  https://opencode.ai/docs/cli/ antes de asumirlo.
