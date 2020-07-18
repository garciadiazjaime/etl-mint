function getPostMessage() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateLabel = yesterday.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `Reporte de ayer ${dateLabel} en #Garita de #SanYsidro 🚘`;
}

module.exports = {
  getPostMessage,
};
