-- FIX: aggiorna la funzione update_invoice_total rimuovendo riferimenti a tax_amount/total_amount
-- Esegui questo script nel SQL Editor di Supabase

CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Aggiorna solo il campo amount basato sulla somma degli item
    UPDATE public.invoices 
    SET 
        amount = calculate_invoice_total(COALESCE(NEW.invoice_id, OLD.invoice_id)),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Nota: il trigger esistente update_invoice_total_on_items_change continuerà a funzionare
-- perché richiama questa funzione aggiornata.

SELECT 'Funzione update_invoice_total aggiornata: rimossi riferimenti a tax_amount/total_amount' AS message;