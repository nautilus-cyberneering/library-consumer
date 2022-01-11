import typer
import datetime
import json
from typer.main import Typer


app: Typer = typer.Typer()


@app.command()
def create_dummy_event(
    event_id: str,
    payload: str,
    githun_run_id: str = typer.Argument(None, envvar="GITHUB_RUN_ID"),
    githun_run_number: str = typer.Argument(None, envvar="GITHUB_RUN_NUMBER"),
):
    typer.echo("Creating dummy event ...")
    typer.echo("event_id: {event_id}")
    typer.echo("payload: {payload}")

    now = ct = datetime.datetime.now()

    event = {
        "id": event_id,
        "name": "dummy",
        "payload": json.loads(payload),
        "metadata": {
            "created_at": {now.timestamp()},
            "githun_run_id": {githun_run_id},
            "githun_run_number": {githun_run_number},
        },
    }

    json_event = json.dumps(event, indent=4)

    typer.echo(f"Event: {json_event}")

    filepath = f"gitmq/events/{event_id}.json"

    with open(filepath, "w") as file:
        file.write(json_event)

    typer.echo(f"Created event file: {filepath}")


@app.command()
def test():
    typer.echo("Test")


if __name__ == "__main__":
    app()
