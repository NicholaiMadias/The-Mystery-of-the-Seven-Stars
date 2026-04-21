/**
 * GULFNEXUS ARCADE OS: STARFIELD GEM-LINK
 * Deployment: Deploy as Web App -> Execute as "Me" -> Access "Anyone"
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('match3')
      .setTitle('Starfield Gem-Link | Nexus Arcade')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Allows embedding in your Hub
}

function saveScore(email, score) {
  // Telemetry Sync to your Matrix backend
  const props = PropertiesService.getScriptProperties();
  props.setProperty(`SCORE_${email}`, score);
  return { success: true, newHighScore: true };
}
