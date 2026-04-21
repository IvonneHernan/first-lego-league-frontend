'use server';

import { revalidatePath } from 'next/cache';
import { EditionsService } from '@/api/editionApi';
import { serverAuthProvider } from '@/lib/authProvider';
import { isAdmin } from '@/lib/authz'; // Reutilizamos tu lógica de isAdmin
import { UsersService } from '@/api/userApi';
import { AuthenticationError } from '@/types/errors';


function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}


async function assertAdminAccess() {
    const auth = await serverAuthProvider.getAuth();
    if (!auth) throw new AuthenticationError();

    const usersService = new UsersService(serverAuthProvider);
    const currentUser = await usersService.getCurrentUser();

    if (!isAdmin(currentUser)) {
        throw new AuthenticationError("No tienes permiso para editar ediciones.", 403);
    }
}

export async function updateEdition(id: string, formData: FormData) {
    try {
        // Ejecutamos el check de seguridad primero
        await assertAdminAccess();

        const year = formData.get('year');
        const venueName = formData.get('venueName');
        const description = formData.get('description');
        // El 'state' lo ignoramos porque el revisor dice que es "backend-managed"

        const service = new EditionsService(serverAuthProvider);

        /**
         * MEJORA 3: Lógica de carga (Payload)
         * Usamos '!== null' para permitir que el usuario borre un campo (cadena vacía).
         * Si usáramos 'venueName ? ...', una cadena vacía sería false y no se enviaría nada.
         */
        await service.updateEdition(id, { 
            year: year ? Number(year) : undefined,
            venueName: venueName !== null ? String(venueName) : undefined,
            description: description !== null ? String(description) : undefined,
        });

        revalidatePath(`/editions/${id}`);
        revalidatePath(`/editions/${id}/edit`);
        
        return { success: true };
    } catch (error) {
        // Retornamos un error "limpio"
        return { 
            success: false, 
            error: getErrorMessage(error, 'Error al actualizar la edición') 
        };
    }
}

export async function fetchEdition(id: string) {
    try {
        const service = new EditionsService(serverAuthProvider);
        return await service.getEditionById(id);
    } catch (error) {
        // En fetchEdition lanzamos el error para que lo capture un 'error.ts' de Next.js
        throw new Error(getErrorMessage(error, 'Error al cargar la edición'));
    }
}