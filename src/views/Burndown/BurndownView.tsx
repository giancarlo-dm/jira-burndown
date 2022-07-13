import { FC, Fragment, useEffect, useState } from "react";
import { useHttp } from "../../hooks";

import { Board } from "../../models";
import { AuthState, useAuthSlice } from "../../store";
import {
    BasicValidators, Form, IControl, IControlGroup, InputText, Select, useControl,
    useControlGroup,
    useDebounce
} from "../../Ui/Forms";
import { Button } from "../../Ui/Layout";
import { ForOf } from "../../Ui/Structural";
import classes from "./BurndownView.module.scss";

const BurndownView: FC = () => {

    //#region Initialization
    const authState: AuthState = useAuthSlice();

    const burndownControlGroup: IControlGroup = useControlGroup({
        project: useControl<string>("", [
            BasicValidators.required()
        ]),
        board: useControl<null | {id: number, name: string}>(null, [
            BasicValidators.required()
        ])
    });

    const boardsHttpRequest = useHttp(
        `https://jiraproducao.totvs.com.br/rest/agile/1.0/board`,
        {
            headers: {
                "Authorization": `Basic ${btoa(`${authState.user!.username}:${authState.user!.password}`)}`
            },
            queryParams: {
                "projectKeyOrId": (burndownControlGroup.controls.project as IControl<string>).value
            }
        },
        async (response: Response) => {
            const json = await response.json();
            console.log(json);
            return json; 
        }
    );
    //#endregion

    //#region Effects
    // Send request to fetch boards when user fills the project key 
    const debouncedProject: string = useDebounce((burndownControlGroup.controls.project as IControl<string>).value, 1000);
    useEffect(
        () => {
            boardsHttpRequest.sendRequest();
        },
        [debouncedProject]
    );
    //#endregion

    //#region Render
    return (
        <section className={classes.burndownConfig}>
            <h1>Hello from "BurndownView"</h1>
            <Form controlGroup={burndownControlGroup}>
                <InputText
                    label="Project" name="project" type="text" placeholder="Ex.: DTCRMSD"
                    required
                    control={burndownControlGroup.controls.project as IControl<string>}
                    errorMessages={{
                        "required": "Project is required"
                    }} />

                <Select
                    label="Board" name="board" 
                    required
                    itemsKey="id"
                    items={boardsHttpRequest.result}
                    control={burndownControlGroup.controls.board as IControl<Board>}>
                    {(item: Board) => (
                        <Fragment>
                            {item.name} ({item.type})
                        </Fragment>
                    )}
                </Select>

                <Button type="submit" size="small">Generate Burndown</Button>
            </Form>
        </section>
    );
    //#endregion
};

export default BurndownView;