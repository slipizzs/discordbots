const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'clear',
    description: 'Löscht eine bestimmte Anzahl von Nachrichten aus dem Kanal.',
    testOnly: true,
    isOnline: true, 
    permissionsRequired: ['MANAGE_MESSAGES'], // Berechtigung zum Löschen von Nachrichten erforderlich
    options: [
      {
        name: 'amount',
        description: 'Die Anzahl der zu löschenden Nachrichten.',
        type: 3, // Integer (Zeichen)
        required: true,
      }
    ],
  
    callback: async (client, interaction) => {
      if (maintenance.isMaintenanceMode()) {
        return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
    }

      // Überprüfen, ob der Benutzer die Berechtigung zum Löschen von Nachrichten hat
      if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
        return interaction.reply({ content: "Du hast keine Berechtigung, Nachrichten zu löschen.", ephemeral: true });
      }
  
      // Die Anzahl der zu löschenden Nachrichten aus der Option 'amount' abrufen
      const amountOption = interaction.options.get('amount');
    if (!amountOption) {
      return interaction.reply({ content: 'Please specify the amount of messages to delete.', ephemeral: true });
    }

    const amount = amountOption.value;
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return interaction.reply({ content: 'Please provide a valid number between 1 and 100.', ephemeral: true });
    }

    try {
      await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `Successfully deleted ${amount} messages.`, ephemeral: true });
    } catch (error) {
      console.error("Error clearing messages:", error);
      await interaction.reply({ content: "An error occurred while trying to clear messages.", ephemeral: true });
    }
    },
  };