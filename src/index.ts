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
type Status = (typeof STATUS)[keyof typeof STATUS];

const DIFFICULTY = Object.freeze({
    EASY: "facil",
    MEDIUM: "medio",
    HARD: "dificil",
})
type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

interface Task {
    title: string;
    description: string;
    id: number;
    status: Status;
    difficulty: Difficulty;
    createdAt: Date;
    dueDate: Date | null;
    lastEdited: Date;
}


//----------Estado inicial de las tareas---------//

const initialTasks: readonly Task[] = Object.freeze([
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
let tasks: Task[] = [...initialTasks];

//-----Funciones de entrada de datos------//
async function getStringInput(message: string): Promise<string> {
    let input: string;
    const MAX_LENGTH = 500;

    while (true) {
        input = await rl.question(message);
        input = input.trim();

        if (input === "") {
            console.log("ERROR: No puedes dejarlo vacío.");
        } else if (input.length > MAX_LENGTH) {
            console.log("ERROR: La entrada es demasiado larga.");
        }
        else {
            return input;
        }
    }
}
async function getMenuNumber(message: string): Promise<number> {
    let input: string = await rl.question(message);
    let number = Number(input);

    if (isNaN(number) || !Number.isInteger(number)) {
        console.log("ERROR: La opcion ingresada no es valida, debes ingresar un numero entero.");
        return getMenuNumber(message);
    } else {
        return number;
    }
}
//----------------------------------------//

//------------Listas de tareas------------//
async function listTasksByStatus(status: "todas" | "pendiente" | "en progreso" | "completado"): Promise<void> {
    console.clear();

    const filteredTasks = 
        status === "todas" 
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

    let userInput: number = await getMenuNumber("\nIngresa el número de la tarea para ver detalles, o 0 para volver: ");
    if (userInput === 0) return;

    if (userInput >= 1 && userInput <= filteredTasks.length) {
        const selectedTask = filteredTasks[userInput - 1]!;
        await showTaskDetails(selectedTask);
    } else {
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
//---------------------------------------//

async function showViewTasksMenu(): Promise<void> {
    let exit: boolean = false;
    do {
        console.clear();
        let tasksMenu: number = await getMenuNumber(`¿Qué tareas deseas ver?

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
async function showTaskDetails(selectedTask: Task): Promise<void> {
    let exit: boolean = false;

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

        switch(option.toUpperCase()) {
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
async function editTask(selectedTask: Task): Promise<void> {
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
async function editTitle(selectedTask: Task): Promise<void> {
    console.clear();
    const input: string = await getStringInput(
        "1. Ingresa un nuevo título (deja en blanco para mantenerlo, espacio para borrar): "
    );

    if (input === "") {
        // Mantener título actual
    } else if (input === " ") {
        selectedTask.title = "";
    } else {
        selectedTask.title = input;
    }
}
async function editDescription(selectedTask: Task): Promise<void> {
    console.clear();
    const input: string = await getStringInput(
        "2. Ingresa una nueva descripción (deja en blanco para mantenerla, espacio para borrar): "
    );

    if (input === "") {
        // Mantener descripción actual
    } else if (input === " ") {
        selectedTask.description = "";
    } else {
        selectedTask.description = input;
    }
}
async function editStatus(selectedTask: Task): Promise<void> {
    console.clear();
    const editStatus: string = (
        await getStringInput(
            `3. Ingresa un nuevo estado:
- pendiente
- en progreso
- completado`
        )
    ).toLowerCase();

    switch (editStatus) {
        case "":
            break; // Mantener estado
        case " ":
            selectedTask.status = "";
            break;
        case "pendiente":
        case "en progreso":
        case "completado":
            selectedTask.status = editStatus as Status;
            break;
        default:
            console.log("Has ingresado un estado inválido.");
    }
}
async function editDifficulty(selectedTask: Task): Promise<void> {
    console.clear();
    const editDifficulty: string = (
        await getStringInput(
            `4. Ingresa una nueva dificultad:
- facil
- medio
- dificil`
        )
    ).toLowerCase();

    switch (editDifficulty) {
        case "":
            break; // Mantener dificultad
        case " ":
            selectedTask.difficulty = "";
            break;
        case "facil":
        case "medio":
        case "dificil":
            selectedTask.difficulty = editDifficulty as Difficulty;
            break;
        default:
            console.log("Has ingresado una dificultad inválida.");
    }
}
async function editDueDate(selectedTask: Task): Promise<void> {
    const input: string = await getStringInput(
        `5. Ingresa nueva fecha de vencimiento (dd/mm/yyyy)
deja en blanco para mantenerla, o escribe un espacio para borrar: `
    );

    if (input === "") {
        return; // Mantener fecha actual
    } else if (input === " ") {
        selectedTask.dueDate = null;
        return;
    } else {
        const parts: string[] = input.split("/");
        if (parts.length === 3) {
            const day: number = parseInt(parts[0]!, 10);
            const month: number = parseInt(parts[1]!, 10) - 1;
            const year: number = parseInt(parts[2]!, 10);


            const newDate: Date = new Date(year, month, day);

            if (!isNaN(newDate.getTime())) {
                selectedTask.dueDate = newDate;
            } else {
                console.log("Fecha inválida. Debe ser un día válido.");
            }
        } else {
            console.log("Formato incorrecto. Usa dd/mm/yyyy.");
        }
    }
}
//---------------------------------------//


//-------Funcion para Buscar tareas--------//
async function searchTasksByTitle(searchTerm: string): Promise<Task[]> {
    return tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
}
async function showSearchTaskMenu(): Promise<void> {
    console.clear();
    const searchTerm: string = await getStringInput(
        "Ingresa el título o parte del título a buscar (o deja en blanco para volver): "
    );

    if (searchTerm === "") {
        // Si deja en blanco, volvemos al menú anterior
        return;
    }

    const results: Task[] = await searchTasksByTitle(searchTerm);

    if (results.length === 0) {
        console.log("\nNo se encontraron tareas que coincidan con tu búsqueda.\n");
        return;
    }

    console.log("\nTareas encontradas:\n");

    results.forEach((task: Task, index: number) => {
        console.log(`${index + 1}. ${task.title}`);
    });

    const userInput: number = await getMenuNumber(
        "\nIngresa el número de la tarea para ver detalles, o 0 para volver: "
    );

    if (userInput === 0) return;

    if (userInput >= 1 && userInput <= results.length) {
        const selectedTask: Task = results[userInput - 1]!;
        await showTaskDetails(selectedTask);
    } else {
        console.log("Opción inválida. Intenta de nuevo.");
        await showSearchTaskMenu();
    }
}
//---------------------------------------//

//------Funcion para agregar tareas-------------//
async function showAddTaskMenu(): Promise<void> {
    console.clear();
    console.log("\n--- Agregar nueva tarea ---\n");

    const title: string = await getStringInput("Título: ");
    const description: string = await getStringInput("Descripción: ");
    
    const status: Status = (await getStringInput(`
Estado:
- pendiente
- en progreso
- completado
Ingresa uno: `)) as Status;

    const difficulty: Difficulty = (await getStringInput(`
Dificultad:
- facil
- medio
- dificil
Ingresa uno: `)) as Difficulty;

    const dueDate: Date | null = await getDueDateInput();

    await addNewTask({ title, description, status, difficulty, dueDate });
}
async function addNewTask({
    title,
    description,
    status,
    difficulty,
    dueDate
}: {
    title: string;
    description: string;
    status: Status;
    difficulty: Difficulty;
    dueDate: Date | null;
}): Promise<void> {
    const newTask: Task = {
        title,
        description,
        status,
        difficulty,
        createdAt: new Date(),
        dueDate
    };

    tasks.push(newTask);
    console.log("\n✅ Tarea agregada correctamente.\n");
}
async function getDueDateInput(): Promise<Date | null> {
    while (true) {
        const input: string = await getStringInput(
            "Ingresa la fecha de vencimiento (dd/mm/yyyy), deja en blanco para no ponerla: "
        );

        if (input === "" || input === " ") {
            return null; // el usuario no quiere poner fecha
        } else {
            const parts: string[] = input.split("/");
            if (parts.length === 3) {
                const day: number = parseInt(parts[0]!, 10);
                const month: number = parseInt(parts[1]!, 10) - 1; // JS cuenta meses desde 0
                const year: number = parseInt(parts[2]!, 10);

                const nuevaFecha: Date = new Date(year, month, day);

                if (!isNaN(nuevaFecha.getTime())) {
                    return nuevaFecha; // fecha válida
                } else {
                    console.log("Fecha inválida, intenta nuevamente.");
                }
            } else {
                console.log("Formato incorrecto. Usa dd/mm/yyyy.");
            }
        }
    }
}
//---------------------------------------//

//-----------// MAIN MENU //-----------// 
async function showMainMenu(): Promise<void> {
    let exit: boolean = false;
    do {
        console.clear();
        let mainMenu: number = await getMenuNumber(`¡Hola Olivia!

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