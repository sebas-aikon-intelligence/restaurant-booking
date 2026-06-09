-- Trigger para crear automáticamente el restaurante y el usuario cuando alguien se registra en Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_restaurant_id UUID;
BEGIN
  -- Validar que vengan los datos mínimos
  IF new.raw_user_meta_data->>'restaurant_name' IS NULL OR new.raw_user_meta_data->>'slug' IS NULL THEN
    -- Si no vienen, simplemente insertamos el usuario sin restaurante o cancelamos.
    -- Vamos a dejar que falle intencionalmente o insertamos datos dummy (mejor evitar)
    -- Para evitar el error 500 silencioso, asegurémonos de que el cast es correcto.
  END IF;

  -- 1. Insertar el restaurante
  INSERT INTO public.restaurants (name, slug)
  VALUES (
    COALESCE(new.raw_user_meta_data->>'restaurant_name', 'Restaurante Sin Nombre'),
    COALESCE(new.raw_user_meta_data->>'slug', 'slug-' || gen_random_uuid()::text)
  )
  RETURNING id INTO new_restaurant_id;

  -- 2. Insertar el perfil del usuario asociado
  INSERT INTO public.users (id, restaurant_id, role, first_name)
  VALUES (
    new.id, 
    new_restaurant_id, 
    'admin'::public.user_role, 
    new.raw_user_meta_data->>'first_name'
  );

  RETURN new;
END;
$$;

-- Eliminamos el trigger si existe para evitar errores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Creamos el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
