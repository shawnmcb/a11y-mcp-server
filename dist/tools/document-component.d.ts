import { z } from 'zod';
export declare const documentComponentInputSchema: {
    componentType: z.ZodEnum<{
        link: "link";
        button: "button";
        modal: "modal";
        dialog: "dialog";
        tabs: "tabs";
        accordion: "accordion";
        menu: "menu";
        dropdown: "dropdown";
        tooltip: "tooltip";
        carousel: "carousel";
        slider: "slider";
        form: "form";
        table: "table";
        alert: "alert";
        toast: "toast";
        combobox: "combobox";
        listbox: "listbox";
        tree: "tree";
        grid: "grid";
        other: "other";
    }>;
    customName: z.ZodOptional<z.ZodString>;
    includeKeyboard: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeAria: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeScreenReader: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export declare function documentComponent(args: {
    componentType: string;
    customName?: string;
    includeKeyboard?: boolean;
    includeAria?: boolean;
    includeScreenReader?: boolean;
}): Promise<string>;
//# sourceMappingURL=document-component.d.ts.map