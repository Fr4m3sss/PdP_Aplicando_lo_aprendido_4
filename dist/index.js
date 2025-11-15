import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
const rl = readline.createInterface({ input, output });
//--------------Interfaz de las tareas----------------//
const STATUS = Object.freeze({
    PENDING: "pendiente",
    IN_PROGRESS: "en progreso",
    COMPLETED: "completado",
    CANCELED: "cancelada"
});
const DIFFICULTY = Object.freeze({
    EASY: "facil",
    MEDIUM: "medio",
    HARD: "dificil",
});
//----------Estado inicial de las tareas---------//
const initialTasks = Object.freeze([
    {
        id: 1,
        title: "Aprender Node.js",
        description: "Revisar documentación y practicar ejemplos",
        status: STATUS.PENDING,
        difficulty: DIFFICULTY.EASY,
        createdAt: new Date(),
        dueDate: null,
        lastEdited: new Date()
    },
    {
        id: 2,
        title: "Aprender Java",
        description: "Revisar documentación y practicar ejemplos",
        status: STATUS.IN_PROGRESS,
        difficulty: DIFFICULTY.MEDIUM,
        createdAt: new Date(),
        dueDate: null,
        lastEdited: new Date()
    }
]);
let tasks = [...initialTasks];
//-----Funciones de entrada de datos (funciones impuras)------//
async function getStringInput(message) {
    let input;
    while (true) {
        input = await rl.question(message);
        input = input.trim();
        if (input === "") {
            console.log("ERROR: No puedes dejarlo vacío.");
        }
        else {
            return input;
        }
    }
}
async function getMenuNumber(message) {
    let input = await rl.question(message);
    let number = Number(input);
    if (isNaN(number) || !Number.isInteger(number)) {
        console.log("ERROR: La opcion ingresada no es valida, debes ingresar un numero entero.");
        return getMenuNumber(message);
    }
    else {
        return number;
    }
}
//----------------------------------------//
//------------Listas de tareas------------//
async function listTasksByStatus(status) {
    console.clear();
    const filteredTasks = status === "todas"
        ? tasks
        : tasks.filter(task => task.status === status);
    if (filteredTasks.length === 0) {
        console.log(`\nNo tienes tareas ${status === "todas" ? "" : status} registradas.\n`);
        return;
    }
    console.log(`\nEstas son tus tareas ${status === "todas" ? "" : status}.\n`);
    filteredTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title}`);
    });
    let userInput = await getMenuNumber("\nIngresa el número de la tarea para ver detalles, o 0 para volver: ");
    if (userInput === 0)
        return;
    if (userInput >= 1 && userInput <= filteredTasks.length) {
        const selectedTask = filteredTasks[userInput - 1];
        await showTaskDetails(selectedTask);
    }
    else {
        console.log("Opción inválida. Intenta de nuevo.");
        await listTasksByStatus(status);
    }
}
async function listAllTasks() {
    await listTasksByStatus("todas");
}
async function listPendingTasks() {
    await listTasksByStatus("pendiente");
}
async function listInProgressTasks() {
    await listTasksByStatus("en progreso");
}
async function listCompletedTasks() {
    await listTasksByStatus("completado");
}
//---Mostrar menu y detalles de tarea-----//
async function showViewTasksMenu() {
    let exit = false;
    do {
        console.clear();
        let tasksMenu = await getMenuNumber(`¿Qué tareas deseas ver?

[1] Todas
[2] Pendientes
[3] En curso
[4] Terminada
[0] Volver

Ingresa una opción: `);
        switch (tasksMenu) {
            case 1:
                await listAllTasks();
                break;
            case 2:
                await listPendingTasks();
                break;
            case 3:
                await listInProgressTasks();
                break;
            case 4:
                await listCompletedTasks();
                break;
            case 0:
                console.log("Volviendo al menú principal");
                exit = true;
                break;
            default:
                break;
        }
    } while (!exit);
}
async function showTaskDetails(selectedTask) {
    let exit = false;
    do {
        console.clear();
        console.log(`
Título: ${selectedTask.title || "Sin título"}
Descripción: ${selectedTask.description || "Sin descripción"}
Estado: ${selectedTask.status || "Sin estado"}
Dificultad: ${selectedTask.difficulty || "Sin dificultad"}
Creada el: ${selectedTask.createdAt?.toLocaleString() || "Desconocida"}
Vencimiento: ${selectedTask.dueDate ? selectedTask.dueDate.toLocaleString() : "Sin fecha"}
Última edición: ${selectedTask.lastEdited ? selectedTask.lastEdited.toLocaleString() : "Nunca"}
        `);
        let option = await getStringInput("Presiona E para editar o 0 para volver: ");
        switch (option.toUpperCase()) {
            case "E":
                await editTask(selectedTask);
                console.log("¡Tarea editada!");
                break;
            case "0":
                exit = true;
                break;
            default:
                console.log("Opción inválida.");
                break;
        }
    } while (!exit);
}
//----Funciones de edición de tareas----//
async function editTask(selectedTask) {
    console.clear();
    console.log(`Estas editando la tarea: ${selectedTask.title}`);
    await editTitle(selectedTask);
    await editDescription(selectedTask);
    await editStatus(selectedTask);
    await editDifficulty(selectedTask);
    await editDueDate(selectedTask);
    selectedTask.lastEdited = new Date();
    console.log("¡Tarea guardada!");
}
async function editTitle(selectedTask) {
    console.clear();
    const input = await rl.question("1. Ingresa un nuevo título (Enter para mantener, espacio para borrar): ");
    // CASO 1: mantener
    if (input === "") {
        return;
    }
    // CASO 2: borrar
    if (input === " ") {
        selectedTask.title = "";
        return;
    }
    const trimmed = input.trim();
    // CASO 3: error
    if (trimmed === "") {
        console.log("El título no puede quedar vacío.");
        return await editTitle(selectedTask);
    }
    // CASO 4: Longitud maxima
    if (trimmed.length > 100) {
        console.log("El título no puede superar los 100 caracteres.");
        return await editTitle(selectedTask);
    }
    // CASO 5: guardar
    selectedTask.title = trimmed;
}
async function editDescription(selectedTask) {
    console.clear();
    const input = await getStringInput("2. Ingresa una nueva descripción (deja en blanco para mantenerla, espacio para borrar): ");
    // Mantener descripción actual
    if (input === "") {
        return;
    }
    if (input === " ") {
        selectedTask.description = "";
        return;
    }
    if (input.length > 500) {
        console.log("La descripción no puede superar los 500 caracteres.");
        return await editDescription(selectedTask);
    }
    selectedTask.description = input;
}
async function editStatus(selectedTask) {
    console.clear();
    const input = await getStringInput(`3. Ingresa un nuevo estado:
- pendiente
- en progreso
- completado
- cancelada
(Enter para mantener): `);
    // Mantener
    if (input === "") {
        return;
    }
    const trimmed = input.trim().toLowerCase();
    // Vacío (solo espacios) → NO permitido
    if (trimmed === "") {
        console.log("El estado no puede quedar vacío.");
        return await editStatus(selectedTask);
    }
    // Lista de estados válidos
    const validStatuses = [
        STATUS.PENDING,
        STATUS.IN_PROGRESS,
        STATUS.COMPLETED,
        STATUS.CANCELED
    ];
    // Validación
    if (!validStatuses.includes(trimmed)) {
        console.log("Has ingresado un estado inválido.");
        return await editStatus(selectedTask);
    }
    // Asignación
    selectedTask.status = trimmed;
}
async function editDifficulty(selectedTask) {
    console.clear();
    const input = (await getStringInput(`4. Ingresa una nueva dificultad:
- facil
- medio
- dificil
(Enter para mantener): `));
    // Mantener
    if (input === "") {
        return;
    }
    const trimmed = input.trim().toLowerCase();
    // Vacío (solo espacios) → NO permitido
    if (trimmed === "") {
        console.log("La dificultad no puede quedar vacía.");
        return await editDifficulty(selectedTask);
    }
    const validDifficulties = [
        DIFFICULTY.EASY,
        DIFFICULTY.MEDIUM,
        DIFFICULTY.HARD
    ];
    if (!validDifficulties.includes(trimmed)) {
        console.log("Has ingresado una dificultad inválida.");
        return await editDifficulty(selectedTask);
    }
    selectedTask.difficulty = trimmed;
}
async function editDueDate(selectedTask) {
    console.clear();
    const input = await getStringInput(`5. Ingresa nueva fecha de vencimiento (dd/mm/yyyy)
(Enter para mantenerla, espacio para borrar): `);
    // Mantener fecha actual
    if (input === "")
        return;
    const trimmed = input.trim();
    // Borrar fecha
    if (trimmed === "") {
        selectedTask.dueDate = null;
        console.log("Fecha eliminada.");
        return;
    }
    // Validar formato básico
    const parts = trimmed.split("/");
    if (parts.length !== 3) {
        console.log("Formato incorrecto. Usa dd/mm/yyyy.");
        return await editDueDate(selectedTask);
    }
    const [dd, mm, yyyy] = parts.map(n => parseInt(n, 10));
    // Validaciones numéricas básicas
    if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) {
        console.log("La fecha debe contener solo números.");
        return await editDueDate(selectedTask);
    }
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1900) {
        console.log("Fecha inválida. Revisa el día, mes o año.");
        return await editDueDate(selectedTask);
    }
    // Validación con Date real
    const newDate = new Date(yyyy, mm - 1, dd);
    if (isNaN(newDate.getTime())) {
        console.log("Fecha inválida.");
        return await editDueDate(selectedTask);
    }
    selectedTask.dueDate = newDate;
    console.log("Fecha actualizada.");
}
//---------------------------------------//
//-------Funcion para Buscar tareas--------//
async function searchTasksByTitle(searchTerm) {
    return tasks.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
}
async function showSearchTaskMenu() {
    console.clear();
    const raw = await rl.question("Ingresa el título o parte del título a buscar (o deja en blanco para volver");
    const searchTerm = raw.trim();
    if (searchTerm === "")
        return;
    const results = await searchTasksByTitle(searchTerm);
    if (results.length === 0) {
        console.log("\nNo se encontraron tareas que coincidan con tu búsqueda.\n");
        return;
    }
    console.log("\nTareas encontradas:\n");
    results.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title}`);
    });
    const userInput = await getMenuNumber("\nIngresa el número de la tarea para ver detalles, o 0 para volver: ");
    if (userInput === 0)
        return;
    if (userInput >= 1 && userInput <= results.length) {
        const selectedTask = results[userInput - 1];
        await showTaskDetails(selectedTask);
    }
    else {
        console.log("Opción inválida. Intenta de nuevo.");
        await showSearchTaskMenu();
    }
}
//---------------------------------------//
//------Funcion para agregar tareas (FLUJO IMPURO)-------------//
function createTask(id, title, description, createdAt, status, difficulty, dueDate) {
    return {
        id,
        title,
        description,
        status,
        difficulty,
        createdAt,
        lastEdited: createdAt,
        dueDate
    };
}
function addTask(tasks, newTask) {
    return [...tasks, newTask];
}
async function getValidStatus() {
    const validStatuses = [
        STATUS.PENDING,
        STATUS.IN_PROGRESS,
        STATUS.COMPLETED,
        STATUS.CANCELED
    ];
    while (true) {
        const input = (await getStringInput(`
Estado:
- pendiente
- en progreso
- completado
- cancelada
Ingresa uno: `)).toLowerCase();
        if (validStatuses.includes(input)) {
            return input;
        }
        console.log("Estado inválido, intenta de nuevo.");
    }
}
async function getValidDifficulty() {
    const validDifficulties = [
        DIFFICULTY.EASY,
        DIFFICULTY.MEDIUM,
        DIFFICULTY.HARD
    ];
    while (true) {
        const input = (await getStringInput(`
Dificultad:
- facil
- medio
- dificil
Ingresa uno: `)).toLowerCase();
        if (validDifficulties.includes(input)) {
            return input;
        }
        console.log("Dificultad inválida, intenta de nuevo.");
    }
}
async function showAddTaskMenu() {
    console.clear();
    console.log("\n--- Agregar nueva tarea ---\n");
    const title = await getStringInput("Título: ");
    const description = await getStringInput("Descripción: ");
    const statusInput = await getValidStatus();
    const difficultyInput = await getValidDifficulty();
    const dueDate = await getDueDateInput();
    const now = new Date();
    const id = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
    const newTask = createTask(id, title, description, now, statusInput, difficultyInput, dueDate);
    tasks = addTask(tasks, newTask);
    console.log(`\n✅ Tarea "${title}" agregada correctamente.`);
}
async function getDueDateInput() {
    while (true) {
        const raw = await rl.question("Ingresa la fecha de vencimiento (dd/mm/yyyy), deja en blanco para no ponerla: ");
        const input = raw.trim();
        if (input === "") {
            return null;
        }
        const parts = input.split("/");
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const nuevaFecha = new Date(year, month, day);
            if (!isNaN(nuevaFecha.getTime())) {
                return nuevaFecha;
            }
            else {
                console.log("Fecha inválida, intenta nuevamente.");
            }
        }
        else {
            console.log("Formato incorrecto. Usa dd/mm/yyyy.");
        }
    }
}
//---------------------------------------//
//-----------// MAIN MENU //-----------// 
async function showMainMenu() {
    let exit = false;
    do {
        console.clear();
        let mainMenu = await getMenuNumber(`¡Hola Olivia!

¿Qué deseas hacer hoy?

[1] Ver mis tareas
[2] Buscar mis tareas
[3] Agregar una tarea
[4] Salir

Ingresa una opción: `);
        switch (mainMenu) {
            case 1:
                await showViewTasksMenu();
                break;
            case 2:
                await showSearchTaskMenu();
                break;
            case 3:
                await showAddTaskMenu();
                break;
            case 4:
                console.log("¡Adiós!");
                rl.close();
                exit = true;
                break;
            default:
                console.log("ERROR: La opción ingresada no se encuentra en el rango de opciones validas.");
                break;
        }
    } while (!exit);
}
showMainMenu();
//------------------------------------//
